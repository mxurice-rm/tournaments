import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { updateTournamentMatch, updateTournamentTeam } from '@/lib/api/mutations'
import { calculateTeamStats, getNextRoundMatches } from '../helper'
import { errorToast } from '@/lib/utils'

export const useTournamentMutations = (tournament: Tournament) => {
  const queryClient = useQueryClient()

  const createTeamUpdates = (matches: TournamentMatch[]): Promise<void>[] => {
    const teamUpdates: Promise<void>[] = []

    matches.forEach((match) => {
      const homeStats = calculateTeamStats(tournament, match, match.homeTeamId)
      teamUpdates.push(updateTournamentTeam(match.homeTeamId, homeStats))

      const awayStats = calculateTeamStats(tournament, match, match.awayTeamId)
      teamUpdates.push(updateTournamentTeam(match.awayTeamId, awayStats))
    })

    return teamUpdates
  }

  const endRoundMutation = useMutation({
    mutationFn: async ({
      currentRoundMatches,
      currentRound,
      rounds
    }: {
      currentRoundMatches: TournamentMatch[]
      currentRound: TournamentRound
      rounds: TournamentRound[]
    }) => {
      const updatePromises: Promise<void>[] = []

      const completeCurrentMatches = currentRoundMatches.map((match) =>
        updateTournamentMatch(match.id, { status: 'completed' })
      )
      updatePromises.push(...completeCurrentMatches)

      const teamStatsUpdates = createTeamUpdates(currentRoundMatches)
      updatePromises.push(...teamStatsUpdates)

      const nextRoundMatches = getNextRoundMatches(currentRound, rounds)
      if (nextRoundMatches.length > 0) {
        const startNextMatches = nextRoundMatches.map((match) =>
          updateTournamentMatch(match.id, { status: 'in_progress' })
        )
        updatePromises.push(...startNextMatches)
      }

      return Promise.all(updatePromises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    },
    onError: (error) => {
      console.error('Error ending round:', error)
      errorToast()
    }
  })

  return {
    endRoundMutation
  }
}