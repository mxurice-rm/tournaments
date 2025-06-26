import {
  MatchPlan,
  Tournament,
  TournamentMatch,
  TournamentRound
} from '@/types'
import { createTableMatchPlan } from './table'

export const createBracketMatchPlan = (
  tournament: Tournament,
  maxParallelGames = 2
): MatchPlan => {
  if (tournament.teams.length < 8) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  if (tournament.teams.length % 2 !== 0) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  const half = Math.ceil(tournament.teams.length / 2)
  const groupATeams = tournament.teams.slice(0, half)
  const groupBTeams = tournament.teams.slice(half)

  if (groupATeams.length < 4 || groupBTeams.length < 4) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  const groupAPlan = createTableMatchPlan(
    { ...tournament, teams: groupATeams },
    maxParallelGames,
    'A'
  )
  const groupBPlan = createTableMatchPlan(
    { ...tournament, teams: groupBTeams },
    maxParallelGames,
    'B'
  )

  const rounds: TournamentRound[] = []
  let matchNumber = 1

  const remainingGroupAMatches: TournamentMatch[] = []
  const remainingGroupBMatches: TournamentMatch[] = []

  groupAPlan.rounds.forEach((round) => {
    remainingGroupAMatches.push(...round.matches)
  })
  groupBPlan.rounds.forEach((round) => {
    remainingGroupBMatches.push(...round.matches)
  })

  while (
    remainingGroupAMatches.length > 0 ||
    remainingGroupBMatches.length > 0
  ) {
    const roundMatches: TournamentMatch[] = []
    const currentRoundNumber = rounds.length + 1

    let groupAIndex = 0
    let groupBIndex = 0

    while (
      roundMatches.length < maxParallelGames &&
      (groupAIndex < remainingGroupAMatches.length ||
        groupBIndex < remainingGroupBMatches.length)
    ) {
      const shouldTakeFromA =
        groupAIndex < remainingGroupAMatches.length &&
        (groupBIndex >= remainingGroupBMatches.length ||
          roundMatches.length % 2 === 0)

      if (shouldTakeFromA) {
        const match = remainingGroupAMatches[groupAIndex]
        roundMatches.push({
          ...match,
          matchNumber: matchNumber++,
          roundNumber: currentRoundNumber,
          matchInRound: roundMatches.length + 1
        })
        groupAIndex++
      } else if (groupBIndex < remainingGroupBMatches.length) {
        const match = remainingGroupBMatches[groupBIndex]
        roundMatches.push({
          ...match,
          matchNumber: matchNumber++,
          roundNumber: currentRoundNumber,
          matchInRound: roundMatches.length + 1
        })
        groupBIndex++
      }
    }

    remainingGroupAMatches.splice(0, groupAIndex)
    remainingGroupBMatches.splice(0, groupBIndex)

    if (roundMatches.length > 0) {
      rounds.push({
        roundNumber: currentRoundNumber,
        matches: roundMatches,
        isComplete: false
      })
    }
  }

  return {
    rounds,
    totalMatches: groupAPlan.totalMatches + groupBPlan.totalMatches,
    totalRounds: rounds.length
  }
}
