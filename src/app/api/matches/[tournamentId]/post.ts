import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import { getTournamentMatches } from '@/lib/database/matches/queries'
import { generateAndStoreMatches } from '@/lib/services/matches'
import { database } from '@/database'
import { teams } from '@/database/schema'
import { eq } from 'drizzle-orm'

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

    try {
      // 1. Reset team stats
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

      // 2. Set tournament groups based on matches
      if (result.matchPlan?.rounds && result.matchPlan.rounds.length > 0) {
        // Sammle alle Team-Gruppe Zuordnungen aus den Matches
        const teamGroupMap = new Map<string, string>()

        result.matchPlan.rounds.forEach(round => {
          round.matches.forEach(match => {
            // Setze Gruppe für Home Team
            if (match.homeTeamId && match.tournamentGroup) {
              teamGroupMap.set(match.homeTeamId, match.tournamentGroup)
            }
            // Setze Gruppe für Away Team
            if (match.awayTeamId && match.tournamentGroup) {
              teamGroupMap.set(match.awayTeamId, match.tournamentGroup)
            }
          })
        })

        // Update Teams mit ihren Gruppen
        const updatePromises = Array.from(teamGroupMap.entries()).map(([teamId, group]) =>
          database
            .update(teams)
            .set({ tournamentGroup: group })
            .where(eq(teams.id, teamId))
        )

        await Promise.all(updatePromises)

        console.log(`Updated ${teamGroupMap.size} teams with tournament groups`)
      }

    } catch (error) {
      console.error('Error updating tournament teams:', error)
      return respondWithError('Failed to reset tournament team stats', 500)
    }

    return respondWithSuccess({
      phase: 'group',
      rounds: result.matchPlan?.rounds.length,
      totalMatches: result.matchPlan?.totalMatches,
      message: 'Group phase matches created successfully'
    })
  } catch (error) {
    console.error('Error creating tournament team:', error)
    return respondWithError('Error creating tournament team', 500)
  }
}