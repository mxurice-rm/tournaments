import { NextRequest, NextResponse } from 'next/server'
import { TeamAPIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentTeamByID } from '@/lib/database/tournament-team/queries'

export async function getTournamentTeamHandler(
  request: NextRequest,
  context?: TeamAPIContext
): Promise<NextResponse> {
  const {
    params: { teamId },
    error: paramError
  } = await validateParams(request, { teamId: validate }, context)
  if (paramError) return paramError
  try {
    const { entity: tournamentTeam, error: tournamentError } =
      await validateEntityExists(teamId, getTournamentTeamByID, 'Tournament-Team')
    if (tournamentError) return tournamentError

    return respondWithSuccess({ tournamentTeam })
  } catch (error) {
    console.error('Error fetching tournament team data:', error)
    return respondWithError('An error occurred', 500)
  }
}
