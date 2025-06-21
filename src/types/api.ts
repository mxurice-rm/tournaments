import { NextRequest, NextResponse } from 'next/server'

export type APIContext = {
  params?: Promise<{ tournamentId: string }>
}

export type APIHandler = (
  req: NextRequest,
  context?: APIContext
) => Promise<NextResponse>