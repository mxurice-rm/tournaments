import { useMemo } from 'react'
import { Tournament } from '@/types'
import {
  getAllCompletedMatches,
  getTournamentPhaseStatus,
  getTournamentWinner,
  getUpcomingRoundsByGroup,
  groupCompletedMatches
} from '../helper'

export const useTournamentData = (tournament: Tournament) => {
  return useMemo(() => {
    const rounds =
      tournament.matchPlan?.rounds?.sort(
        (a, b) => a.roundNumber - b.roundNumber
      ) ?? []

    const currentRound = rounds.find((round) => !round.isComplete)

    const currentRoundMatches =
      currentRound?.matches
        .filter((match) => match.status === 'in_progress')
        .sort((a, b) => a.matchInRound - b.matchInRound) ?? []

    const upcomingRounds = rounds
      .filter((round) => round.roundNumber > (currentRound?.roundNumber ?? 0))
      .filter((round) =>
        round.matches.some((match) => match.status === 'scheduled')
      )

    const upcomingMatchesByGroup = getUpcomingRoundsByGroup(upcomingRounds)
    const completedMatches = getAllCompletedMatches(tournament)
    const completedMatchesByGroup = groupCompletedMatches(
      completedMatches,
      tournament
    )
    const phaseStatus = getTournamentPhaseStatus(tournament)
    const tournamentWinner = getTournamentWinner(
      tournament,
      phaseStatus.finalCompleted
    )

    const canEndRound =
      currentRoundMatches.length > 0 &&
      currentRoundMatches.every(
        (match) => match.homeScore !== null && match.awayScore !== null
      )

    return {
      rounds,
      currentRound,
      currentRoundMatches,
      upcomingRounds,
      upcomingMatchesByGroup,
      completedMatches,
      completedMatchesByGroup,
      phaseStatus,
      tournamentWinner,
      canEndRound
    }
  }, [tournament])
}