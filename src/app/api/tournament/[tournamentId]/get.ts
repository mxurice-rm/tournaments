import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateTournamentExists, validateTournamentId } from '@/lib/api/utilts'

export async function getTournamentHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const { tournamentId, error: idError } = await validateTournamentId(
    request,
    context
  )
  if (idError) return idError

  try {
    const { tournament, error: tournamentError } =
      await validateTournamentExists(tournamentId)
    if (tournamentError) return tournamentError

    return respondWithSuccess({ tournament })
  } catch (error) {
    console.error('Error fetching tournament data:', error)
    return respondWithError('An error occurred', 500)
  }
}
