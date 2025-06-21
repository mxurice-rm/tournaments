import { Row } from '@/types/database'
import { Tournament } from '@/types'
import { hydrateFromRows } from '@/lib/utils'

export const hydrateTournaments = (rows: Row[]): Tournament[] => {
  return hydrateFromRows<Row, Tournament>(rows, ({ map, row }) =>
    upsertTournamentWithTeam({ tournamentMap: map, row })
  )
}

const parseTournamentRow = (row: Row['tournaments']): Tournament => ({
  ...row!,
  date: new Date(row!.date),
  teams: []
})

export const upsertTournamentWithTeam = ({
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
    const existingTeam = tournament.teams.find((team) => team.id === row.teams!.id);
    if (!existingTeam) {
      tournament.teams.push({
        ...row.teams,
        members: [],
      });
    }

    if (row.teamMembers) {
      const team = tournament.teams.find((team) => team.id === row.teams!.id)!;
      team.members.push(row.teamMembers);
    }
  }
}
