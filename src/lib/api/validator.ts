import { NextRequest, NextResponse } from 'next/server'
import { APIContext } from '@/types'
import { respondWithError } from '@/lib/utils'
import {
  EntityFetcher,
  ParamValidators,
  ValidatedParamsResult
} from '@/types/api-validator'

export async function validateParams(
  request: NextRequest,
  validators: ParamValidators,
  context?: APIContext
): Promise<ValidatedParamsResult> {
  const rawParams = ((await context?.params) as Record<string, string>) || {}

  const params: Record<string, string> = {}
  for (const [key, validator] of Object.entries(validators)) {
    const value = rawParams[key]
    if (!value || !validator(value)) {
      return {
        params: {},
        error: respondWithError(`Invalid ${key}`, 400)
      }
    }
    params[key] = value
  }

  return { params }
}

export async function validateEntityExists<T>(
  id: string,
  fetcher: EntityFetcher<T>,
  entityName: string
): Promise<{ entity: T | null; error?: NextResponse }> {
  try {
    const entity = await fetcher(id)

    if (!entity) {
      return {
        entity: null,
        error: respondWithError(
          `${entityName} with the given id does not exist`,
          404
        )
      }
    }

    return { entity }
  } catch (error) {
    console.error(`Error fetching ${entityName}:`, error)
    return {
      entity: null,
      error: respondWithError('An error occurred', 500)
    }
  }
}
