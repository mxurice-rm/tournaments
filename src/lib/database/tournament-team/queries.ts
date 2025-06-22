import { TournamentTeam } from '@/types'
import { database } from '@/database'
import { teamMembers, teams } from '@/database/schema'
import { and, eq, SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql/sql'
import { hydrateTournamentTeam } from '@/lib/database/tournament-team/utilts'

const findTournamentTeam = async (
  filter: SQL | undefined
): Promise<TournamentTeam | null> => {
  const query = database
    .select({
      teams,
      teamMembers
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(filter)

  const queryResult = await query

  return hydrateTournamentTeam(queryResult)
}

export const getTournamentTeam = async (
  tournamentId: string,
  team: string
): Promise<TournamentTeam | null> => {
  return findTournamentTeam(
    and(
      eq(
        sql`LOWER(
        ${teams.name}
        )`,
        team.toLowerCase()
      ),
      eq(teams.tournamentId, tournamentId)
    )
  )
}

export const getTournamentTeamByID = async (
  teamId: string
): Promise<TournamentTeam | null> => {
  return findTournamentTeam(eq(teams.id, teamId))
}
