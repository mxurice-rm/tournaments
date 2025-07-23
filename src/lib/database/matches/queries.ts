import { database } from '@/database'
import { matches } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { TournamentMatch } from '@/types'

export const getTournamentMatches = async (
  tournamentId: string
): Promise<TournamentMatch[] | null> => {
  return database
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournamentId))
}

export const getTournamentMatchByID = async (
  id: string
): Promise<TournamentMatch | null> => {
  const query = database.select().from(matches).where(eq(matches.id, id))

  const queryResult = await query

  return queryResult[0] ?? null
}
