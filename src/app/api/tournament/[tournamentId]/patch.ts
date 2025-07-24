import { Tournament, TournamentAPIContext } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { z } from 'zod'
import { TournamentSchema } from '@/lib/schemas'
import { tournaments } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { database } from '@/database'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import { updatedDiff } from 'deep-object-diff'

const UpdateTournamentSchema = TournamentSchema.partial().extend({
  date: z.string().optional()
})
type UpdateTournamentType = z.infer<typeof UpdateTournamentSchema>

export async function patchTournamentHandler(
  request: NextRequest,
  context?: TournamentAPIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  const { entity: tournament, error: tournamentError } =
    await validateEntityExists(tournamentId, getTournamentByID, 'Tournament')
  if (tournamentError) return tournamentError

  let updates: UpdateTournamentType
  try {
    const body = await request.json()
    updates = UpdateTournamentSchema.parse(body)
  } catch {
    return respondWithError('Invalid tournament updates provided', 400)
  }

  const fieldsToUpdate = getChangedFields(tournament!, updates)

  if (Object.keys(fieldsToUpdate).length === 0) {
    return respondWithError('No tournament updates detected', 400)
  }

  try {
    await database
      .update(tournaments)
      .set(fieldsToUpdate)
      .where(eq(tournaments.id, tournamentId))
  } catch (error) {
    console.error('Error updating tournament:', error)
    return respondWithError('Failed to update tournament', 500)
  }

  return respondWithSuccess({
    message: 'Tournament updated successfully',
    updatedFields: fieldsToUpdate
  })
}

function getChangedFields(
  tournament: Tournament,
  updates: UpdateTournamentType
): Partial<UpdateTournamentType> {
  const changes = updatedDiff(
    tournament,
    updates
  ) as Partial<UpdateTournamentType>

  if (updates.date && changes.date) {
    const existingDateISO = tournament.date.toISOString()
    const newDateISO = new Date(updates.date).toISOString()

    if (existingDateISO === newDateISO) {
      delete changes.date
    }
  }

  return changes
}
