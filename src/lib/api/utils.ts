import { APIContext, APIHandler } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import { respondWithError } from '@/lib/utils'
import { z } from 'zod'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

// Next.js 15 RouteContext type (params is always a Promise)
type NextRouteContext<T = Record<string, string>> = {
  params: Promise<T>
}

// Next.js Route Handler type
type NextRouteHandler<T = Record<string, string>> = (
    req: NextRequest,
    context: NextRouteContext<T>
) => Promise<NextResponse>

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

// Original withAuthentication for internal use
const withAuthenticationInternal = <T = Record<string, string>>(
    handler: APIHandler<T>
): APIHandler<T> => {
  return async (req: NextRequest, context?: APIContext<T>) => {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, context)
  }
}

// Adapter that converts Next.js RouteContext to APIContext
const createRouteAdapter = <T = Record<string, string>>(
    handler: APIHandler<T>
): NextRouteHandler<T> => {
  return async (req: NextRequest, nextContext: NextRouteContext<T>) => {
    // Convert Next.js context to APIContext
    // In Next.js 15, params is always a Promise
    const apiContext: APIContext<T> = {
      params: nextContext.params // Keep as Promise
    }

    return handler(req, apiContext)
  }
}

// Public wrapper for routes that need authentication
export const withAuthentication = <T = Record<string, string>>(
    handler: APIHandler<T>
): NextRouteHandler<T> => {
  const authenticatedHandler = withAuthenticationInternal(handler)
  return createRouteAdapter(authenticatedHandler)
}

// Public wrapper for routes that don't need authentication
export const withoutAuthentication = <T = Record<string, string>>(
    handler: APIHandler<T>
): NextRouteHandler<T> => {
  return createRouteAdapter(handler)
}