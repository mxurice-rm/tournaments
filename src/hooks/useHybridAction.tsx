import { ActionConfig, ActionState, INITIAL_ACTION_STATE } from '@/types'
import { z, ZodTypeAny } from 'zod'
import { startTransition, useActionState, useCallback, useState } from 'react'

export function useHybridAction<Schema extends ZodTypeAny>(
  actionConfig: ActionConfig<Schema>
) {
  const [clientActionState, setClientActionState] = useState<ActionState>(INITIAL_ACTION_STATE)
  const [isClientActionPending, setIsClientActionPending] = useState(false)

  const [serverActionState, serverAction, isServerActionPending] = useActionState(
    actionConfig.mode === 'server' ? actionConfig.action : async () => INITIAL_ACTION_STATE,
    INITIAL_ACTION_STATE
  )

  const isPending = actionConfig.mode === 'server' ? isServerActionPending : isClientActionPending
  const state = actionConfig.mode === 'server' ? serverActionState : clientActionState

  const handleClientAction = useCallback(async (formData: z.infer<Schema>): Promise<ActionState> => {
    if (actionConfig.mode === 'server') {
      throw new Error('Client action called on server mode configuration')
    }

    setIsClientActionPending(true)

    try {
      const result = await actionConfig.action(formData)
      setClientActionState(result)
      return result
    } catch (error) {
      const errorState: ActionState = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: undefined,
        data: undefined
      }
      setClientActionState(errorState)
      return errorState
    } finally {
      setIsClientActionPending(false)
    }
  }, [actionConfig])

  const handleServerAction = useCallback(async (formData: z.infer<Schema>): Promise<ActionState> => {
    if (actionConfig.mode !== 'server') {
      throw new Error('Server action called on client mode configuration')
    }

    return new Promise((resolve) => {
      startTransition(() => {
        serverAction(formData)
        resolve(serverActionState)
      })
    })
  }, [actionConfig, serverAction, serverActionState])

  const executeAction = useCallback(async (formData: z.infer<Schema>): Promise<ActionState> => {
    if (actionConfig.mode === 'server') {
      return handleServerAction(formData)
    } else {
      return handleClientAction(formData)
    }
  }, [actionConfig.mode, handleClientAction, handleServerAction])

  return {
    state,
    isPending,
    executeAction
  }
}