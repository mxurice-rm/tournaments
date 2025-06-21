'use client'

import React, { useState } from 'react'
import TournamentForm from '@/components/feature/tournament/forms/tournament-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { TournamentSchema } from '@/lib/schemas'
import { ActionState } from '@/types'
import { createTournament } from '@/lib/api/mutations'
import BaseDialog from '@/components/common/base-dialog'

const CreateTournamentDialog = () => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof TournamentSchema>) => {
      return await createTournament(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })

  return (
    <BaseDialog
      open={isOpen}
      setOpen={setIsOpen}
      title="Turnier erstellen"
      description="Erstelle hier ein demnächst anstehendes Turnier und verwalte
              dieses."
      triggerButton={
        <Button size="sm">
          <Plus />
          Neues Turnier
        </Button>
      }
    >
      <TournamentForm
        defaultValues={{
          name: '',
          description: '',
          date: new Date(),
          location: '',
          type: 'bracket'
        }}
        onSuccess={() => {
          setIsOpen(false)
        }}
        submitButton={{ label: 'Turnier erstellen' }}
        actionConfig={{
          mode: 'client',
          action: async (
            values: z.infer<typeof TournamentSchema>
          ): Promise<ActionState> => {
            try {
              await mutation.mutateAsync(values)

              return {
                success: true,
                message: 'Das Turnier wurde erfolgreich aktualisiert'
              }
            } catch (error) {
              return {
                success: false,
                error: (error as Error).message
              }
            }
          }
        }}
      />
    </BaseDialog>
  )
}

export default CreateTournamentDialog
