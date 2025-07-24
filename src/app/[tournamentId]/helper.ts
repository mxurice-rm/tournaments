import { Tournament, TournamentMatch, TournamentRound } from '@/types'

export interface GroupedRounds {
  groupA: Array<{ round: TournamentRound; matches: TournamentMatch[] }>
  groupB: Array<{ round: TournamentRound; matches: TournamentMatch[] }>
}

export interface TournamentStats {
  points: number
  wins: number
  draws: number
  looses: number
  goals: number
  goalsAgainst: number
}

export interface TournamentPhaseStatus {
  groupPhaseCompleted: boolean
  semifinalCompleted: boolean
  finalCompleted: boolean
}

export const getMatchesByGroup = (
  matches: TournamentMatch[],
  group: string
): TournamentMatch[] => {
  return matches.filter((match) => match.tournamentGroup === group)
}

export const getUpcomingRoundsByGroup = (upcomingRounds: TournamentRound[]): GroupedRounds => {
  if (!upcomingRounds?.length) return { groupA: [], groupB: [] }

  const groupA: GroupedRounds['groupA'] = []
  const groupB: GroupedRounds['groupB'] = []

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
  currentRound: TournamentRound | null,
  rounds: TournamentRound[]
): TournamentMatch[] => {
  if (!currentRound || !rounds?.length) return []

  const nextRound = rounds.find(
    (round) => round.roundNumber === currentRound.roundNumber + 1
  )

  return nextRound?.matches.filter((match) => match.status === 'scheduled') ?? []
}

export const calculateTeamStats = (
  tournament: Tournament,
  match: TournamentMatch,
  teamId: string
): TournamentStats => {
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

  const isHomeTeam = match.homeTeamId === teamId
  const teamGoals = isHomeTeam ? (match.homeScore ?? 0) : (match.awayScore ?? 0)
  const opponentGoals = isHomeTeam ? (match.awayScore ?? 0) : (match.homeScore ?? 0)

  const matchResult = getMatchResult(teamGoals, opponentGoals)

  return {
    points: (currentTeam.points ?? 0) + matchResult.points,
    wins: (currentTeam.wins ?? 0) + matchResult.wins,
    draws: (currentTeam.draws ?? 0) + matchResult.draws,
    looses: (currentTeam.looses ?? 0) + matchResult.looses,
    goals: (currentTeam.goals ?? 0) + teamGoals,
    goalsAgainst: (currentTeam.goalsAgainst ?? 0) + opponentGoals
  }
}

const getMatchResult = (teamGoals: number, opponentGoals: number) => {
  if (teamGoals > opponentGoals) {
    return { points: 3, wins: 1, draws: 0, looses: 0 }
  } else if (teamGoals === opponentGoals) {
    return { points: 1, wins: 0, draws: 1, looses: 0 }
  } else {
    return { points: 0, wins: 0, draws: 0, looses: 1 }
  }
}

export const getTournamentPhaseStatus = (
  tournament: Tournament
): TournamentPhaseStatus => {
  const isPhaseCompleted = (phase: string): boolean => {
    const rounds = tournament.matchPlan?.rounds
    if (!rounds?.length) return false

    const phaseMatches = rounds
      .flatMap(round => round.matches)
      .filter(match => match.phase === phase)
    
    // Wenn es keine Matches für diese Phase gibt, ist sie nicht abgeschlossen
    if (phaseMatches.length === 0) return false
    
    // Nur wenn alle Matches abgeschlossen sind UND Ergebnisse haben
    return phaseMatches.every(match => 
      match.status === 'completed' && 
      match.homeScore !== null && 
      match.awayScore !== null
    )
  }

  const groupPhaseCompleted = isPhaseCompleted('group')
  const semifinalCompleted = groupPhaseCompleted && isPhaseCompleted('semifinal')
  const finalCompleted = groupPhaseCompleted && semifinalCompleted && isPhaseCompleted('final')

  return {
    groupPhaseCompleted,
    semifinalCompleted,
    finalCompleted
  }
}

export const getMatchGroup = (
  match: TournamentMatch, 
  tournament: Tournament
): string | null => {
  if (match.tournamentGroup) {
    return match.tournamentGroup
  }

  const homeTeam = tournament.teams.find(team => team.id === match.homeTeamId)
  const awayTeam = tournament.teams.find(team => team.id === match.awayTeamId)

  if (
    homeTeam?.tournamentGroup &&
    awayTeam?.tournamentGroup &&
    homeTeam.tournamentGroup === awayTeam.tournamentGroup
  ) {
    return homeTeam.tournamentGroup
  }

  return null
}

export const getAllCompletedMatches = (tournament: Tournament): TournamentMatch[] => {
  const rounds = tournament.matchPlan?.rounds ?? []
  return rounds.flatMap((round) =>
    round.matches
      .filter((match) => match.status === 'completed')
      .map((match) => ({ ...match, roundNumber: round.roundNumber }))
  )
}

export const getTournamentWinner = (
  tournament: Tournament,
  finalCompleted: boolean
): { teamName: string; teamId: string } | null => {
  if (!finalCompleted) return null

  const completedMatches = getAllCompletedMatches(tournament)
  const finalMatch = completedMatches.find((match) => match.phase === 'final')
  
  if (
    !finalMatch ||
    finalMatch.homeScore === null ||
    finalMatch.awayScore === null
  ) {
    return null
  }

  const winnerId =
    finalMatch.homeScore > finalMatch.awayScore
      ? finalMatch.homeTeamId
      : finalMatch.awayTeamId

  const winnerTeam = tournament.teams.find((team) => team.id === winnerId)
  return winnerTeam ? { teamName: winnerTeam.name, teamId: winnerId } : null
}

export const groupCompletedMatches = (
  matches: TournamentMatch[],
  tournament: Tournament
) => {
  return {
    A: matches.filter(
      (match) => getMatchGroup(match, tournament) === 'A' || match.phase === 'final'
    ),
    B: matches.filter(
      (match) => getMatchGroup(match, tournament) === 'B' || match.phase === 'final'
    )
  }
}
