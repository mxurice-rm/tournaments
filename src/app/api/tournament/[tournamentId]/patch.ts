import { APIContext, Tournament } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { z } from 'zod'
import { TournamentSchema } from '@/lib/schemas'
import { tournaments } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { database } from '@/database'
import { validateTournamentExists, validateTournamentId } from '@/lib/api/utilts'

const UpdateTournamentSchema = TournamentSchema.partial().extend({
  date: z.string().optional()
})
type UpdateTournamentType = z.infer<typeof UpdateTournamentSchema>

export async function patchTournamentHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const { tournamentId, error: idError } = await validateTournamentId(
    request,
    context
  )
  if (idError) return idError

  const { tournament, error: tournamentError } =
    await validateTournamentExists(tournamentId)
  if (tournamentError) return tournamentError

  let updates: UpdateTournamentType
  try {
    const body = await request.json()
    updates = UpdateTournamentSchema.parse(body)
  } catch {
    return respondWithError('Invalid tournament updates provided', 400)
  }

  const fieldsToUpdate = buildUpdateFields(updates, tournament!)

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

function buildUpdateFields(
  updates: UpdateTournamentType,
  tournament: Tournament
): Partial<UpdateTournamentType> {
  return Object.keys(updates).reduce((result, key) => {
    const typedKey = key as keyof UpdateTournamentType
    const newValue = updates[typedKey]

    if (newValue !== undefined) {
      if (typedKey === 'date') {
        const existingDate = new Date(tournament[typedKey]!).toISOString()
        const newDate = new Date(newValue as string).toISOString()

        if (existingDate !== newDate) {
          result[typedKey] = newValue
        }
      } else if (typedKey === 'type') {
        if (newValue !== tournament[typedKey]) {
          result[typedKey] = newValue as 'table' | 'bracket'
        }
      } else if (newValue !== tournament[typedKey]) {
        result[typedKey] = newValue
      }
    }

    return result
  }, {} as Partial<UpdateTournamentType>)
}
