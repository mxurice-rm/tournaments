import { NextRequest, NextResponse } from 'next/server'

// Updated APIContext for Next.js 15 (params is always a Promise)
export type APIContext<T = Record<string, string>> = {
  params?: Promise<T>
}

export type TournamentAPIContext = APIContext<{ tournamentId: string }>
export type MatchAPIContext = APIContext<{ matchId: string }>
export type TeamAPIContext = APIContext<{ teamId: string }>

export type APIHandler<T = Record<string, string>> = (
  req: NextRequest,
  context?: APIContext<T>
) => Promise<NextResponse>

export type TournamentAPIHandler = APIHandler<{ tournamentId: string }>
export type MatchAPIHandler = APIHandler<{ matchId: string }>
export type TeamAPIHandler = APIHandler<{ teamId: string }>