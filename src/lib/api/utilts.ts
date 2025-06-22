import { APIContext, APIHandler } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError } from '@/lib/utils'
import { z } from 'zod'
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
    return { data }
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    return {
      data: null as T,
      error: respondWithError(errorMessage, 400)
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
