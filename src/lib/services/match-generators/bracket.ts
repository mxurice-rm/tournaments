import {
  MatchPlan,
  Tournament,
  TournamentMatch,
  TournamentRound,
} from '@/types'
import { createTableMatchPlan } from './table'

// Generate a bracket style tournament.
// Teams are split into two groups and a table style match plan is
// created for each group. The rounds of both groups are then
// interleaved so that teams get as much pause as possible between
// matches.
export const createBracketMatchPlan = (
  tournament: Tournament,
  maxParallelGames = 2
): MatchPlan => {
  if (tournament.teams.length < 8) {
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
  const maxRounds = Math.max(groupAPlan.rounds.length, groupBPlan.rounds.length)

  for (let i = 0; i < maxRounds; i++) {
    const roundMatches: TournamentMatch[] = []

    if (i < groupAPlan.rounds.length) {
      groupAPlan.rounds[i].matches.forEach(m => {
        roundMatches.push({
          ...m,
          matchNumber: matchNumber++,
          roundNumber: rounds.length + 1,
        })
      })
    }

    if (i < groupBPlan.rounds.length) {
      groupBPlan.rounds[i].matches.forEach(m => {
        roundMatches.push({
          ...m,
          matchNumber: matchNumber++,
          roundNumber: rounds.length + 1,
        })
      })
    }

    if (roundMatches.length > 0) {
      rounds.push({
        roundNumber: rounds.length + 1,
        matches: roundMatches,
        isComplete: false,
      })
    }
  }

  return {
    rounds,
    totalMatches: groupAPlan.totalMatches + groupBPlan.totalMatches,
    totalRounds: rounds.length,
  }
}
