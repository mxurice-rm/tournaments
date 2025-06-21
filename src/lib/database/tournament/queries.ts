import { Tournament } from '@/types'
import { database } from '@/database'
import { teamMembers, teams, tournaments } from '@/database/schema'
import { eq, SQL } from 'drizzle-orm'
import { hydrateTournaments } from '@/lib/database/tournament/utils'
import { sql } from 'drizzle-orm/sql/sql'

const findTournament = async (filter: SQL): Promise<Tournament | null> => {
  const query = database
    .select({
      tournaments,
      teams,
      teamMembers
    })
    .from(tournaments)
    .leftJoin(teams, eq(teams.tournamentId, tournaments.id))
    .leftJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(filter)

  const queryResult = await query

  return hydrateTournaments(queryResult)[0] ?? null
}

export const getTournaments = async (): Promise<Tournament[]> => {
  const query = database
    .select()
    .from(tournaments)
    .leftJoin(teams, eq(teams.tournamentId, tournaments.id))

  const queryResult = await query

  return hydrateTournaments(queryResult)
}

export const getTournamentByID = async (
  id: string
): Promise<Tournament | null> => {
  return await findTournament(eq(tournaments.id, id))
}

export const getTournament = async (
  name: string
): Promise<Tournament | null> => {
  return await findTournament(
    eq(
      sql`LOWER(
      ${tournaments.name}
      )`,
      name.toLowerCase()
    )
  )
}
