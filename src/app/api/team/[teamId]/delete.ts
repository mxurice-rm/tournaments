import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { database } from '@/database'
import { teams } from '@/database/schema'
import { eq } from 'drizzle-orm'
import { validateEntityExists, validateParams } from '@/lib/api/validator'
import { validate } from 'uuid'
import { getTournamentTeamByID } from '@/lib/database/tournament-team/queries'

export async function deleteTournamentTeamHandler(
  request: NextRequest,
  context?: APIContext
): Promise<NextResponse> {
  const {
    params: { teamId },
    error: paramError
  } = await validateParams(request, { teamId: validate }, context)
  if (paramError) return paramError

  const { error: tournamentTeamError } = await validateEntityExists(
    teamId,
    getTournamentTeamByID,
    'Tournament-Team'
  )
  if (tournamentTeamError) return tournamentTeamError

  try {
    await database.delete(teams).where(eq(teams.id, teamId))

    return respondWithSuccess({
      message: 'Tournament team deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting tournament team: ', error)
    return respondWithError('Error deleting tournament team', 500)
  }
}
