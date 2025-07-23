import { Tournament, TournamentMatch, TournamentRound } from '@/types'

export const getMatchesByGroup = (
  matches: TournamentMatch[],
  group: string
) => {
  return matches.filter((match) => match.tournamentGroup === group)
}

export const getUpcomingRoundsByGroup = (upcomingRounds: TournamentRound[]) => {
  if (!upcomingRounds) return { groupA: [], groupB: [] }

  const groupA: Array<{
    round: TournamentRound
    matches: TournamentMatch[]
  }> = []
  const groupB: Array<{
    round: TournamentRound
    matches: TournamentMatch[]
  }> = []

  upcomingRounds.forEach((round) => {
    const groupAMatches = getMatchesByGroup(round.matches, 'A')
    const groupBMatches = getMatchesByGroup(round.matches, 'B')

    if (groupAMatches.length > 0) {
      groupA.push({ round, matches: groupAMatches })
    }

    if (groupBMatches.length > 0) {
      groupB.push({ round, matches: groupBMatches })
    }
  })

  return { groupA, groupB }
}

export const getNextRoundMatches = (
  currentRound: TournamentRound,
  rounds: TournamentRound[]
): TournamentMatch[] => {
  if (!currentRound) return []

  const nextRound = rounds.find(
    (round) => round.roundNumber === currentRound.roundNumber + 1
  )

  if (!nextRound) return []

  return nextRound.matches.filter((match) => match.status === 'scheduled')
}

export const calculateTeamStats = (
  tournament: Tournament,
  match: TournamentMatch,
  teamId: string
) => {
  const isHomeTeam = match.homeTeamId === teamId
  const teamGoals = isHomeTeam ? (match.homeScore ?? 0) : (match.awayScore ?? 0)
  const opponentGoals = isHomeTeam
    ? (match.awayScore ?? 0)
    : (match.homeScore ?? 0)

  // Finde das aktuelle Team
  const currentTeam = tournament.teams.find((team) => team.id === teamId)
  if (!currentTeam) {
    console.error(`Team ${teamId} not found`)
    return {
      points: 0,
      wins: 0,
      draws: 0,
      looses: 0,
      goals: 0,
      goalsAgainst: 0
    }
  }

  // Berechne neue Werte für dieses Match
  let newPoints = 0
  let newWins = 0
  let newDraws = 0
  let newLooses = 0

  if (teamGoals > opponentGoals) {
    // Sieg
    newPoints = 3
    newWins = 1
  } else if (teamGoals === opponentGoals) {
    // Unentschieden
    newPoints = 1
    newDraws = 1
  } else {
    // Niederlage
    newLooses = 1
  }

  // Addiere zu bestehenden Stats
  return {
    points: (currentTeam.points ?? 0) + newPoints,
    wins: (currentTeam.wins ?? 0) + newWins,
    draws: (currentTeam.draws ?? 0) + newDraws,
    looses: (currentTeam.looses ?? 0) + newLooses,
    goals: (currentTeam.goals ?? 0) + teamGoals,
    goalsAgainst: (currentTeam.goalsAgainst ?? 0) + opponentGoals
  }
}
