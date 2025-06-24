'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { TournamentTeamSchema } from '@/lib/schemas'
import { ActionState, Tournament } from '@/types'
import { createTournamentTeam } from '@/lib/api/mutations'
import BaseDialog from '@/components/common/base-dialog'
import TournamentTeamForm from '@/components/feature/tournament-team/forms/tournament-team-form'

const CreateTournamentTeamDialog = ({ tournament }: { tournament: Tournament }) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof TournamentTeamSchema>) => {
      return await createTournamentTeam(tournament.id, values)
    },
    onSuccess: () => {
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    }
  })

  return (
    <BaseDialog
      open={isOpen}
      setOpen={setIsOpen}
      title="Neues Team erstellen"
      description="Erstelle hier ein neues Team für das ausgewählte Turnier."
      triggerButton={
        <Button size="sm" className={tournament.teams.length > 0 ? 'flex-1' : ''}>
          <Plus />
          Neues Team
        </Button>
      }
    >
      <TournamentTeamForm
        defaultValues={{ name: '', members: [] }}
        submitButton={{ label: 'Team erstellen', className: '-mt-2.5' }}
        actionConfig={{
          mode: 'client',
          action: async (
            values: z.infer<typeof TournamentTeamSchema>
          ): Promise<ActionState> => {
            try {
              await mutation.mutateAsync(values)

              return {
                success: true,
                message: 'Das Team wurde erfolgreich erstellt'
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

export default CreateTournamentTeamDialog
