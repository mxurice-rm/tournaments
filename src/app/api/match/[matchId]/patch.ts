import { MatchAPIContext, TournamentMatch } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { z } from 'zod'
import { matches } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { database } from '@/database'
import { validateEntityExists } from '@/lib/api/validator'
import { validate } from 'uuid'
import { updatedDiff } from 'deep-object-diff'
import { getTournamentMatchByID } from '@/lib/database/matches/queries'
import { TournamentMatchSchema } from '@/lib/schemas'

type UpdateMatchType = z.infer<typeof TournamentMatchSchema>

interface MatchValidationResult {
  fieldsToUpdate: Partial<UpdateMatchType>
  error?: NextResponse
}

interface MatchUpdateParams {
  matchId: string
  updates: UpdateMatchType
  match: TournamentMatch
  fieldsToUpdate: Partial<UpdateMatchType>
}

const validateMatchUpdate = (
  match: TournamentMatch,
  updates: UpdateMatchType
): MatchValidationResult => {
  const fieldsToUpdate = getChangedFields(match, updates)

  if (Object.keys(fieldsToUpdate).length === 0) {
    return {
      fieldsToUpdate,
      error: respondWithError('No tournament updates detected', 400)
    }
  }

  if (
    match.status === 'scheduled' &&
    (fieldsToUpdate.awayScore !== undefined ||
      fieldsToUpdate.homeScore !== undefined)
  ) {
    return {
      fieldsToUpdate,
      error: respondWithError('Game has not started yet', 400)
    }
  }

  if (
    fieldsToUpdate.status === 'completed' &&
    (match.homeScore === null || match.awayScore === null)
  ) {
    return {
      fieldsToUpdate,
      error: respondWithError('No goals set', 400)
    }
  }

  return { fieldsToUpdate }
}

const updateMatchInDatabase = async (
  params: MatchUpdateParams
): Promise<NextResponse | null> => {
  try {
    await database
      .update(matches)
      .set(params.fieldsToUpdate)
      .where(eq(matches.id, params.matchId))

    return null
  } catch (error) {
    console.error('Error updating match:', error)
    return respondWithError('Failed to update match', 500)
  }
}

const extractMatchId = async (context?: MatchAPIContext): Promise<string | null> => {
  if (!context?.params) {
    return null
  }

  try {
    const params = await context.params
    return params?.matchId || null
  } catch (error) {
    console.error('Error extracting match ID from context:', error)
    return null
  }
}

export async function patchMatchHandler(
  request: NextRequest,
  context?: MatchAPIContext
): Promise<NextResponse> {
  const matchId = await extractMatchId(context)
  if (!matchId) {
    return respondWithError('Match ID is required', 400)
  }

  // Validate matchId
  if (!validate(matchId)) {
    return respondWithError('Invalid match ID format', 400)
  }

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

  const { fieldsToUpdate, error: validationError } = validateMatchUpdate(
    match!,
    updates
  )
  if (validationError) return validationError

  const updateError = await updateMatchInDatabase({
    matchId,
    updates,
    match: match!,
    fieldsToUpdate
  })
  if (updateError) return updateError

  return respondWithSuccess({
    message: 'Match updated successfully',
    updatedFields: fieldsToUpdate
  })
}

const getChangedFields = (
  match: TournamentMatch,
  updates: UpdateMatchType
): Partial<UpdateMatchType> => {
  return updatedDiff(match, updates) as Partial<UpdateMatchType>
}