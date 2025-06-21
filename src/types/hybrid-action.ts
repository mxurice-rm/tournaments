import { z, ZodTypeAny } from 'zod'
import { useForm } from 'react-hook-form'

export const INITIAL_ACTION_STATE: ActionState = {
    success: false,
    error: '',
    message: undefined,
    data: undefined
}

export type SuccessActionState<Data = Record<string, unknown>> = {
    success: true
    message: string
    error?: never
    data?: Data
}

export type ErrorActionState<Data = Record<string, unknown>> = {
    success: false
    message?: never
    error: string
    data?: Data
}

export type ActionState<Data = Record<string, unknown>> =
    | SuccessActionState<Data>
    | ErrorActionState<Data>

export type ServerActionConfig<Schema extends ZodTypeAny> = {
    mode: 'server'
    action: (
        prevState: ActionState,
        values: z.infer<Schema>
    ) => Promise<ActionState>
}

export type ClientActionConfig<Schema extends ZodTypeAny> = {
    mode: 'client'
    action: (values: z.infer<Schema>) => Promise<ActionState> | ActionState
}

export type ActionConfig<Schema extends ZodTypeAny> =
    | ServerActionConfig<Schema>
    | ClientActionConfig<Schema>

export type FormCallback = (
    state: ActionState,
    form: ReturnType<typeof useForm>
) => void
