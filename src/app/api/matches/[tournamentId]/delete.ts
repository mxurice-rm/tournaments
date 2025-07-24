import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { database } from '@/database'
import { matches, teams } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'

export async function deleteTournamentMatchesHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  const { error: tournamentError } = await validateEntityExists(
    tournamentId,
    getTournamentByID,
    'Tournament-Team'
  )
  if (tournamentError) return tournamentError

  try {
    await database.delete(matches).where(eq(matches.tournamentId, tournamentId))

    await database
      .update(teams)
      .set({
        points: 0,
        wins: 0,
        draws: 0,
        looses: 0,
        goals: 0,
        goalsAgainst: 0,
        playedMatches: 0,
        tournamentGroup: null
      })
      .where(eq(teams.tournamentId, tournamentId))

    return respondWithSuccess({
      message: 'Tournament matches deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tournament matches: ', error)
    return respondWithError('Error deleting tournament matches', 500)
  }
}
