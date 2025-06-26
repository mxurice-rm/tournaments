import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { getTournamentByID } from '@/lib/database/tournament'

export async function getTournamentMatchesHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  try {
    const { entity: tournamentTeam, error: tournamentError } =
      await validateEntityExists(tournamentId, getTournamentByID, 'Tournament')
    if (tournamentError) return tournamentError

    return respondWithSuccess({ tournamentTeam })
  } catch (error) {
    console.error('Error fetching tournament team data:', error)
    return respondWithError('An error occurred', 500)
  }
}
