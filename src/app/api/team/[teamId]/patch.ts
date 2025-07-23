import { APIContext } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { z } from 'zod'
import { TournamentTeamUpdateSchema } from '@/lib/schemas'
import { teamMembers, teams } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { database } from '@/database'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentTeamByID } from '@/lib/database/tournament-team/queries'
import { updatedDiff } from 'deep-object-diff'

type UpdateTournamentTeamType = z.infer<typeof TournamentTeamUpdateSchema>

export async function patchTournamentTeamHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { teamId },
    error: paramError
  } = await validateParams(request, { teamId: validate }, context)
  if (paramError) return paramError

  const { entity: tournamentTeam, error: tournamentError } =
    await validateEntityExists(teamId, getTournamentTeamByID, 'Tournament-Team')
  if (tournamentError) return tournamentError

  if (!tournamentTeam) {
    return respondWithError('Tournament team not found', 404)
  }

  let updates: UpdateTournamentTeamType
  try {
    const body = await request.json()
    updates = TournamentTeamUpdateSchema.parse(body)
  } catch (error) {
    console.error('Invalid tournament team updates provided', error)
    return respondWithError('Invalid tournament team updates provided', 400)
  }

  const { members, ...teamUpdates } = updates

  const fieldsToUpdate = updatedDiff(tournamentTeam, teamUpdates)

  let hasMemberUpdates = false
  if (members !== undefined) {
    const currentMembers = await database
      .select({ name: teamMembers.name })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId))

    const currentMemberNames = currentMembers.map((m) => m.name).sort()
    const newMemberNames = members?.slice().sort()

    hasMemberUpdates =
      JSON.stringify(currentMemberNames) !== JSON.stringify(newMemberNames)
  }

  const hasTeamUpdates = Object.keys(fieldsToUpdate).length > 0

  if (!hasTeamUpdates && !hasMemberUpdates) {
    return respondWithError('No tournament updates detected', 400)
  }

  try {
    await database.transaction(async (tx) => {
      if (hasTeamUpdates) {
        await tx.update(teams).set(fieldsToUpdate).where(eq(teams.id, teamId))
      }

      if (hasMemberUpdates) {
        await tx.delete(teamMembers).where(eq(teamMembers.teamId, teamId))

        if (members && members.length > 0) {
          const memberInserts = members.map((memberName) => ({
            name: memberName,
            teamId: teamId
          }))
          await tx.insert(teamMembers).values(memberInserts)
        }
      }
    })
  } catch (error) {
    console.error('Error updating tournament team:', error)
    return respondWithError('Failed to update tournament team', 500)
  }

  const updatedFields: Record<string, string[] | undefined> = {}

  if (hasTeamUpdates) {
    Object.assign(updatedFields, fieldsToUpdate)
  }

  if (hasMemberUpdates) {
    updatedFields.members = members
  }

  return respondWithSuccess({
    message: 'Tournament team updated successfully',
    updatedFields
  })
}
