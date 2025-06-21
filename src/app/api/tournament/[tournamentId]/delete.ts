import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { validateTournamentExists, validateTournamentId } from '@/lib/api/utilts'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { database } from '@/database'
import { tournaments } from '@/database/schema'
import { eq } from 'drizzle-orm'

export async function deleteTournamentHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const { tournamentId, error: idError } = await validateTournamentId(
    request,
    context
  )
  if (idError) return idError

  const { error: tournamentError } =
    await validateTournamentExists(tournamentId)
  if (tournamentError) return tournamentError

  try {
    await database.delete(tournaments).where(eq(tournaments.id, tournamentId))

    return respondWithSuccess({ message: "Tournament deleted successfully" })
  } catch (error) {
    console.error("Error deleting tournament: ", error)
    return respondWithError("Error deleting tournament", 500)
  }

}
