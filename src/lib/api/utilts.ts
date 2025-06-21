import { APIContext, APIHandler, Tournament } from '@/types'
import {NextRequest, NextResponse} from 'next/server'
import {respondWithError} from '@/lib/utils'
import {z} from 'zod'
import {validate} from 'uuid'
import {getTournamentByID} from '@/lib/database/tournament'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function parseRequestBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>,
    errorMessage = 'Invalid request body'
): Promise<{ data: T; error?: NextResponse }> {
    try {
        const body = await request.json()
        const data = schema.parse(body)
        return {data}
    } catch (error) {
        console.error(`${errorMessage}:`, error)
        return {
            data: null as T,
            error: respondWithError(errorMessage, 400)
        }
    }
}

export async function validateTournamentId(
    request: NextRequest,
    context?: APIContext
): Promise<{ tournamentId: string; error?: NextResponse }> {
    const {tournamentId} = (await context?.params) || {}

    if (!tournamentId || !validate(tournamentId)) {
        return {
            tournamentId: '',
            error: respondWithError('Invalid tournament ID; must be a UUID', 400)
        }
    }

    return {tournamentId}
}

export async function validateTournamentExists(tournamentId: string): Promise<{
    tournament: Tournament | null
    error?: NextResponse
}> {
    try {
        const tournament = await getTournamentByID(tournamentId)

        if (!tournament) {
            return {
                tournament: null,
                error: respondWithError('Tournament with the given id does not exist', 404)
            }
        }

        return {tournament}
    } catch (error) {
        console.error('Error fetching tournament:', error)
        return {
            tournament: null,
            error: respondWithError('An error occurred', 500)
        }
    }
}

export const withAuthentication = (handler: APIHandler): APIHandler => {
  return async (req: NextRequest, context?: APIContext) => {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, context)
  }
}