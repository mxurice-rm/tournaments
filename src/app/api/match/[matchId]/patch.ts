import { APIContext, TournamentMatch } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { z } from 'zod'
import { matches } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { database } from '@/database'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { updatedDiff } from 'deep-object-diff'
import { getTournamentMatchByID } from '@/lib/database/matches/queries'
import { TournamentMatchSchema } from '@/lib/schemas'

type UpdateMatchType = z.infer<typeof TournamentMatchSchema>

export async function patchMatchHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { matchId },
    error: paramError
  } = await validateParams(request, { matchId: validate }, context)
  if (paramError) return paramError

  const { entity: match, error: matchError } = await validateEntityExists(
    matchId,
    getTournamentMatchByID,
    'Match'
  )
  if (matchError) return matchError

  let updates: UpdateMatchType
  try {
    const body = await request.json()
    updates = TournamentMatchSchema.parse(body)
  } catch {
    return respondWithError('Invalid match updates provided', 400)
  }

  const fieldsToUpdate = getChangedFields(match!, updates)

  if (Object.keys(fieldsToUpdate).length === 0) {
    return respondWithError('No tournament updates detected', 400)
  }

  if(match?.status === 'scheduled' && (fieldsToUpdate.awayScore || fieldsToUpdate.homeScore)) {
    return respondWithError('Game has not started yet', 400)
  }

  if(fieldsToUpdate.status === 'completed' && (match?.homeScore === null || match?.awayScore === null)) {
    return respondWithError('No goals set', 400)
  }

  try {
    await database
      .update(matches)
      .set(fieldsToUpdate)
      .where(eq(matches.id, matchId))
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
  matches: TournamentMatch,
  updates: UpdateMatchType
): Partial<UpdateMatchType> {
  return updatedDiff(matches, updates) as Partial<UpdateMatchType>
}
