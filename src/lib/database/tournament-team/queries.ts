import { TournamentTeam } from '@/types'
import { database } from '@/database'
import { teamMembers, teams } from '@/database/schema'
import { and, eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql/sql'
import { hydrateTournamentTeam } from '@/lib/database/tournament-team/utilts'

export const getTournamentTeam = async (
  tournamentId: string,
  team: string
): Promise<TournamentTeam | null> => {
  const query = database
    .select({
      teams,
      teamMembers
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(
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

  const queryResult = await query

  return hydrateTournamentTeam(queryResult)
}
