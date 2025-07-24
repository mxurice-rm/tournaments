import { NextRequest, NextResponse } from 'next/server'
import { TournamentAPIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { TournamentTeamSchema } from '@/lib/schemas'
import { getTournamentTeam } from '@/lib/database/tournament-team/queries'
import { database } from '@/database'
import { teamMembers, teams } from '@/database/schema'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'

export async function postTournamentTeamHandler(
  request: NextRequest,
  context?: TournamentAPIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  try {
    const { error: tournamentError } = await validateEntityExists(
      tournamentId,
      getTournamentByID,
      'Tournament'
    )
    if (tournamentError) return tournamentError

    let teamData
    try {
      const body = await request.json()
      teamData = TournamentTeamSchema.parse(body)
    } catch (error) {
      console.error('Invalid tournament team data provided', error)
      return respondWithError('Invalid tournament team data provided', 400)
    }

    const team = await getTournamentTeam(tournamentId, teamData.name)
    if (team) {
      return respondWithError('Team with the given name already exists', 400)
    }

    const [createdTeam] = await database
      .insert(teams)
      .values({
        tournamentId,
        ...teamData
      })
      .returning()
      .execute()

    if (!createdTeam) {
      return respondWithError('Error creating tournament team', 500)
    }

    if (teamData.members && teamData.members.length !== 0) {
      const values = teamData.members.map((member) => ({
        teamId: createdTeam.id,
        name: member
      }))
      await database.insert(teamMembers).values(values).execute()
    }

    return respondWithSuccess({ team: teamData })
  } catch (error) {
    console.error('Error creating tournament team:', error)
    return respondWithError('Error creating tournament team', 500)
  }
}
