import { Row } from '@/types/database'
import { TournamentTeam } from '@/types'
import { hydrateFromRows } from '@/lib/utils'

export const upsertTeamWithMembers = ({
  tournamentTeamMap,
  row
}: {
  tournamentTeamMap: Map<string, TournamentTeam>
  row: Row
}) => {
  const teamId = row.teams?.id
  if (!teamId) return

  if (!tournamentTeamMap.has(teamId)) {
    tournamentTeamMap.set(teamId, {
      ...row.teams!,
      id: teamId,
      members: []
    })
  }

  const team = tournamentTeamMap.get(teamId)!

  if (row.teamMembers && !team.members.some(member => member.id === row.teamMembers!.id)) {
    team.members.push(row.teamMembers)
  }
}

export const hydrateTournamentTeam = (rows: Row[]): TournamentTeam | null => {
  const result = hydrateFromRows<Row, TournamentTeam>(rows, ({ map, row }) =>
    upsertTeamWithMembers({ tournamentTeamMap: map, row })
  )
  return result[0] ?? null
}