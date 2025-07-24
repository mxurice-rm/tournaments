import { NextRequest, NextResponse } from 'next/server'
import { TournamentAPIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'

export async function getTournamentHandler(
  request: NextRequest,
  context?: TournamentAPIContext
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

    return respondWithSuccess({ tournament })
  } catch (error) {
    console.error('Error fetching tournament data:', error)
    return respondWithError('An error occurred', 500)
  }
}
