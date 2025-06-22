import { NextResponse } from 'next/server'

type ValidatorFn = (value: string) => boolean

export type ParamValidators = Record<string, ValidatorFn>

export type ValidatedParamsResult = {
  params: Record<string, string>
  error?: NextResponse
}

export type EntityFetcher<T> = (id: string) => Promise<T | null>
