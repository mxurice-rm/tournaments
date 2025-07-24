import { NextRequest, NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { TournamentSchema } from '@/lib/schemas'
import { database } from '@/database'
import { tournaments } from '@/database/schema'
import { getTournament } from '@/lib/database/tournament'

export async function postTournamentHandler(
  request: NextRequest
): Promise<NextResponse> {
  try {
    let tournamentData
    try {
      const body = await request.json()
      tournamentData = TournamentSchema.parse(body)
    } catch (error) {
      console.error('Invalid tournament data provided', error)
      return respondWithError('Invalid tournament data provided', 400)
    }

    const tournament = await getTournament(tournamentData.name)

    if (tournament) {
      return respondWithError(
        'Tournament with the given name already exist',
        404
      )
    }

    const [createdTournament] = await database
      .insert(tournaments)
      .values({
        ...tournamentData,
        date: tournamentData.date.toISOString().split('T')[0]
      })
      .returning()
      .execute()

    if (!createdTournament) {
      return respondWithError('Error creating tournament team', 500)
    }

    return respondWithSuccess({ tournament: tournamentData })
  } catch (error) {
    console.error('Error creating tournament team:', error)
    return respondWithError('Error creating tournament team', 500)
  }
}
