import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import { getTournamentMatches } from '@/lib/database/matches/queries'
import { generateAndStorePlayoffMatches } from '@/lib/services/matches'

export async function postTournamentPlayoffHandler(
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

    // Parse request body für Phase
    const body = await request.json()
    const { phase } = body

    if (!phase || !['semifinal', 'final'].includes(phase)) {
      return respondWithError('Invalid phase. Must be "semifinal" or "final"', 400)
    }

    // Hole alle existierenden Matches
    const existingMatches = await getTournamentMatches(tournamentId)
    if (!existingMatches || existingMatches.length === 0) {
      return respondWithError('No matches found for tournament', 400)
    }

    // Prüfe ob Phase bereits existiert
    const phaseExists = existingMatches.some(match => match.phase === phase)
    if (phaseExists) {
      return respondWithError(`${phase} matches already exist`, 400)
    }

    // Validierungen für spezifische Phasen
    if (phase === 'semifinal') {
      // Prüfe ob Gruppenphase abgeschlossen ist
      const groupMatches = existingMatches.filter(m => m.phase === 'group')
      const allGroupMatchesCompleted = groupMatches.every(m =>
        m.status === 'completed' &&
        m.homeScore !== null &&
        m.awayScore !== null
      )

      if (!allGroupMatchesCompleted) {
        return respondWithError('Group phase not completed yet', 400)
      }
    }

    if (phase === 'final') {
      // Prüfe ob Halbfinale abgeschlossen ist
      const semifinalMatches = existingMatches.filter(m => m.phase === 'semifinal')
      if (semifinalMatches.length === 0) {
        return respondWithError('Semifinal matches not created yet', 400)
      }

      const allSemifinalCompleted = semifinalMatches.every(m =>
        m.status === 'completed' &&
        m.homeScore !== null &&
        m.awayScore !== null
      )

      if (!allSemifinalCompleted) {
        return respondWithError('Semifinal phase not completed yet', 400)
      }
    }

    const result = await generateAndStorePlayoffMatches(
      tournament!,
      existingMatches,
      phase
    )

    if (!result.success) {
      return respondWithError(
        result.error?.message || `${phase} generation failed`,
        500
      )
    }

    return respondWithSuccess({
      phase,
      rounds: result.matchPlan?.rounds.length,
      totalMatches: result.matchPlan?.totalMatches,
      savedMatches: result.savedMatches,
      message: `${phase === 'semifinal' ? 'Semifinal' : 'Final'} matches created successfully`
    })

  } catch (error) {
    console.error(`Error creating matches:`, error)
    return respondWithError(`Error creating matches`, 500)
  }
}
