import { NextResponse } from 'next/server'
import { respondWithError, respondWithSuccess } from '@/lib/utils'
import { getTournaments } from '@/lib/database/tournament'

export async function getTournamentsHandler(): Promise<NextResponse> {
  try {
    const tournaments = await getTournaments()

    return respondWithSuccess({ tournaments }, 200)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return respondWithError('Error fetching tournaments', 500)
  }
}
