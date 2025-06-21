import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z, ZodTypeAny } from 'zod'
import { ActionState, Field, NormalizedFieldGroup } from '@/types'
import { NextResponse } from 'next/server'
import { USERNAME_ERROR_CODES } from 'better-auth/plugins/username'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type USERNAME_ERROR_CODES_KEYS = keyof typeof USERNAME_ERROR_CODES

export const authenticationMapping: Partial<Record<USERNAME_ERROR_CODES_KEYS, string>> = {
  INVALID_USERNAME_OR_PASSWORD: 'Benutzername oder Passwort ist falsch.',
  INVALID_USERNAME: 'Ungültiger Benutzername.',
}

export const tournamentTypeMapping: Record<string, string> = {
  'bracket': 'Turnierbaum',
  'table': 'Tabelle',
}

export function createAction<
  Schema extends ZodTypeAny,
  Data = Record<string, unknown>
>(
  schema: Schema,
  handler: (
    formData: z.infer<Schema>,
    prevState: ActionState
  ) => Promise<ActionState<Data>>
) {
  return async function (
    _prevState: ActionState,
    formData: z.infer<Schema> | FormData
  ): Promise<ActionState<Data>> {
    try {
      const validatedData = schema.parse(formData)

      return handler(validatedData, _prevState)
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

export function normalizeFieldsToGroups<Schema extends ZodTypeAny>(
  fields: Field<Schema>[]
): NormalizedFieldGroup<Schema>[] {
  return fields.map((field) =>
    'fields' in field
      ? { isGroup: true, fields: field.fields }
      : { isGroup: false, fields: [field] }
  );
}

export function sortFieldsByPosition<Schema extends ZodTypeAny>(
  fields: Field<Schema>[]
): Field<Schema>[] {
  return [...fields].sort((a, b) => a.position - b.position);
}

export function respondWithSuccess(data: object, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function respondWithError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error || 'Ein unbekannter Fehler ist aufgetreten.')
  }

  return data
}

export function hydrateFromRows<RowType, EntityType>(
  rows: RowType[],
  upsertFn: (args: { map: Map<string, EntityType>; row: RowType }) => void
): EntityType[] {
  const map = new Map<string, EntityType>()
  for (const row of rows) {
    upsertFn({ map, row })
  }
  return Array.from(map.values())
}