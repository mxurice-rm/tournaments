import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import { getTournamentMatches } from '@/lib/database/matches/queries'
import { generateAndStoreMatches } from '@/lib/services/matches'

export async function postTournamentMatchHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  try {
    const { entity: tournament, error: tournamentError } =
      await validateEntityExists(tournamentId, getTournamentByID, 'Tournament')
    if (tournamentError) return tournamentError

    const matches = await getTournamentMatches(tournamentId)
    if (matches?.length !== 0) {
      return respondWithError('Tournament already has matches', 400)
    }

    const result = await generateAndStoreMatches(tournament!)
    if (!result.success) {
      return respondWithError(
        result.error?.message || 'Match generation failed',
        500
      )
    }

    return respondWithSuccess({
      rounds: result.matchPlan?.rounds.length,
      totalMatches: result.matchPlan?.totalMatches
    })
  } catch (error) {
    console.error('Error creating tournament team:', error)
    return respondWithError('Error creating tournament team', 500)
  }
}
