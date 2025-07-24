import {
  MatchPlan,
  Tournament,
  TournamentMatch,
  TournamentRound,
  TournamentTeam
} from '@/types'

export const sortTeamsByRanking = (teams: TournamentTeam[]) => {
  return teams.sort((a, b) => {
    // Sortierung: Punkte > Tordifferenz > Geschossene Tore
    const pointsDiff = (b.points ?? 0) - (a.points ?? 0)
    if (pointsDiff !== 0) return pointsDiff

    const aGoalDiff = (a.goals ?? 0) - (a.goalsAgainst ?? 0)
    const bGoalDiff = (b.goals ?? 0) - (b.goalsAgainst ?? 0)
    const goalDiffDiff = bGoalDiff - aGoalDiff
    if (goalDiffDiff !== 0) return goalDiffDiff

    return (b.goals ?? 0) - (a.goals ?? 0)
  })
}

const getQualifiedTeams = (teams: TournamentTeam[]) => {
  const groupATeams = teams.filter((team) => team.tournamentGroup === 'A')

  const groupBTeams = teams.filter((team) => team.tournamentGroup === 'B')

  return {
    groupA: sortTeamsByRanking(groupATeams).slice(0, 2), // Top 2
    groupB: sortTeamsByRanking(groupBTeams).slice(0, 2) // Top 2
  }
}

const getSemifinalWinners = (matches: TournamentMatch[]) => {
  const semifinalMatches = matches.filter(
    (match) =>
      match.phase === 'semifinal' &&
      match.status === 'completed' &&
      match.homeScore !== null &&
      match.awayScore !== null
  )

  const winners: { group: string; teamId: string }[] = []

  semifinalMatches.forEach((match) => {
    const group = match.tournamentGroup!

    if (match.homeScore! > match.awayScore!) {
      winners.push({ group, teamId: match.homeTeamId })
    } else {
      winners.push({ group, teamId: match.awayTeamId })
    }
  })

  return winners
}

export const createSemifinalMatchPlan = (
  tournament: Tournament,
  existingMatches: TournamentMatch[]
): MatchPlan => {
  const qualifiedTeams = getQualifiedTeams(tournament.teams)

  if (qualifiedTeams.groupA.length < 2 || qualifiedTeams.groupB.length < 2) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  const maxRoundNumber = Math.max(
    ...existingMatches.map((match) => match.roundNumber)
  )
  const maxMatchNumber = Math.max(
    ...existingMatches.map((match) => match.matchNumber)
  )

  const semifinalMatches: TournamentMatch[] = []

  const semifinalA: TournamentMatch = {
    id: crypto.randomUUID(),
    homeTeamId: qualifiedTeams.groupA[0].id,
    awayTeamId: qualifiedTeams.groupA[1].id,
    homeScore: null,
    awayScore: null,
    status: 'in_progress',
    phase: 'semifinal',
    matchNumber: maxMatchNumber + 1,
    roundNumber: maxRoundNumber + 1,
    matchInRound: 1,
    tournamentId: tournament.id,
    tournamentGroup: 'A'
  }

  const semifinalB: TournamentMatch = {
    id: crypto.randomUUID(),
    homeTeamId: qualifiedTeams.groupB[0].id,
    awayTeamId: qualifiedTeams.groupB[1].id,
    homeScore: null,
    awayScore: null,
    status: 'in_progress',
    phase: 'semifinal',
    tournamentId: tournament.id,
    matchNumber: maxMatchNumber + 2,
    roundNumber: maxRoundNumber + 1,
    matchInRound: 2,
    tournamentGroup: 'B'
  }

  semifinalMatches.push(semifinalA, semifinalB)

  const semifinalRound: TournamentRound = {
    roundNumber: maxRoundNumber + 1,
    matches: semifinalMatches,
    isComplete: false
  }

  return {
    rounds: [semifinalRound],
    totalMatches: 2,
    totalRounds: 1
  }
}

export const createFinalMatchPlan = (
  tournament: Tournament,
  existingMatches: TournamentMatch[]
): MatchPlan => {
  const semifinalWinners = getSemifinalWinners(existingMatches)

  if (semifinalWinners.length < 2) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  const maxRoundNumber = Math.max(
    ...existingMatches.map((match) => match.roundNumber)
  )
  const maxMatchNumber = Math.max(
    ...existingMatches.map((match) => match.matchNumber)
  )

  const groupAWinner = semifinalWinners.find((winner) => winner.group === 'A')
  const groupBWinner = semifinalWinners.find((winner) => winner.group === 'B')

  if (!groupAWinner || !groupBWinner) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 }
  }

  const finalMatch: TournamentMatch = {
    id: crypto.randomUUID(),
    homeTeamId: groupAWinner.teamId,
    awayTeamId: groupBWinner.teamId,
    homeScore: null,
    awayScore: null,
    status: 'in_progress',
    tournamentGroup: null,
    phase: 'final',
    matchNumber: maxMatchNumber + 1,
    roundNumber: maxRoundNumber + 1,
    matchInRound: 1,
    tournamentId: tournament.id
  }

  const finalRound: TournamentRound = {
    roundNumber: maxRoundNumber + 1,
    matches: [finalMatch],
    isComplete: false
  }

  return {
    rounds: [finalRound],
    totalMatches: 1,
    totalRounds: 1
  }
}

export const generatePlayoffMatches = async (
  tournament: Tournament,
  existingMatches: TournamentMatch[],
  phase: 'semifinal' | 'final'
): Promise<{ success: boolean; matchPlan?: MatchPlan; error?: Error }> => {
  try {
    let matchPlan: MatchPlan

    if (phase === 'semifinal') {
      matchPlan = createSemifinalMatchPlan(tournament, existingMatches)
    } else {
      matchPlan = createFinalMatchPlan(tournament, existingMatches)
    }

    if (matchPlan.totalMatches === 0) {
      return {
        success: false,
        error: new Error(
          phase === 'semifinal'
            ? 'Not enough qualified teams for the semifinals'
            : 'Semi-finals not yet completed'
        )
      }
    }

    return { success: true, matchPlan }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown Error')
    }
  }
}
