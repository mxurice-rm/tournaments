import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { database } from '@/database'
import { tournaments } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'

export async function deleteTournamentHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { tournamentId },
    error: paramError
  } = await validateParams(request, { tournamentId: validate }, context)
  if (paramError) return paramError

  const { error: tournamentError } = await validateEntityExists(
    tournamentId,
    getTournamentByID,
    'Tournament'
  )
  if (tournamentError) return tournamentError

  try {
    await database.delete(tournaments).where(eq(tournaments.id, tournamentId))

    return respondWithSuccess({ message: "Tournament deleted successfully" })
  } catch (error) {
    console.error("Error deleting tournament: ", error)
    return respondWithError("Error deleting tournament", 500)
  }

}
