import { Row } from '@/types/database'
import { Tournament, TournamentMatch } from '@/types'
import { hydrateFromRows } from '@/lib/utils'

export const hydrateTournaments = (rows: Row[]): Tournament[] => {
  return hydrateFromRows<Row, Tournament>(rows, ({ map, row }) =>
    upsertTournament({ tournamentMap: map, row })
  )
}

const parseTournamentRow = (row: Row['tournaments']): Tournament => ({
  ...row!,
  date: new Date(row!.date),
  teams: [],
  matchPlan: null
})

export const upsertTournament = ({
  tournamentMap,
  row
}: {
  tournamentMap: Map<string, Tournament>
  row: Row
}) => {
  const tournamentId = row.tournaments?.id
  if (!tournamentId) return

  if (!tournamentMap.has(tournamentId)) {
    tournamentMap.set(tournamentId, parseTournamentRow(row.tournaments))
  }

  const tournament = tournamentMap.get(tournamentId)!

  if (row.teams) {
    const existingTeam = tournament.teams.find(
      (team) => team.id === row.teams!.id
    )
    if (!existingTeam) {
      tournament.teams.push({
        ...row.teams,
        members: []
      })
    }

    if (row.teamMembers) {
      const team = tournament.teams.find((team) => team.id === row.teams!.id)!
      if (!team.members.some(member => member.id === row.teamMembers!.id)) {
        team.members.push(row.teamMembers)
      }
    }
  }

  if (row.matches) {
    if (!tournament.matchPlan) {
      tournament.matchPlan = {
        rounds: [],
        totalMatches: 0,
        totalRounds: 0
      }
    }

    const match: TournamentMatch = {
      ...row.matches,
    }

    let round = tournament.matchPlan.rounds.find(
      (r) => r.roundNumber === match.roundNumber
    )
    if (!round) {
      round = {
        roundNumber: match.roundNumber,
        matches: [],
        isComplete: false
      }
      tournament.matchPlan.rounds.push(round)
    }

    const existingMatch = round.matches.find((m) => m.id === match.id)
    if (!existingMatch) {
      round.matches.push(match)
    }
  }

  if (tournament.matchPlan) {
    tournament.matchPlan.totalMatches = tournament.matchPlan.rounds.reduce(
      (total, round) => total + round.matches.length,
      0
    )
    tournament.matchPlan.totalRounds = tournament.matchPlan.rounds.length

    tournament.matchPlan.rounds.sort((a, b) => a.roundNumber - b.roundNumber)

    tournament.matchPlan.rounds.forEach((round) => {
      round.matches.sort((a, b) => a.matchInRound - b.matchInRound)

      round.isComplete = round.matches.every(
        (match) => match.status === 'completed'
      )
    })
  }
}
