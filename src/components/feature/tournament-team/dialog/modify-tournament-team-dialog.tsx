'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { TournamentTeamSchema } from '@/lib/schemas'
import { ActionState, TournamentTeam } from '@/types'
import { updateTournamentTeam } from '@/lib/api/mutations'
import BaseDialog from '@/components/common/base-dialog'
import TournamentTeamForm from '@/components/feature/tournament-team/forms/tournament-team-form'

const ModifyTournamentTeamDialog = ({
  tournamentTeam
}: {
  tournamentTeam: TournamentTeam
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof TournamentTeamSchema>) => {
      return await updateTournamentTeam(tournamentTeam.id, values)
    },
    onSuccess: () => {
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: [tournamentTeam.id] })
    }
  })

  return (
    <BaseDialog
      open={isOpen}
      setOpen={setIsOpen}
      title="Team bearbeiten"
      description="Hier können allgemeine Änderungen an dem Team vorgenommen werden."
      triggerButton={
        <Button size="sm">
          <Pencil />
          Änderungen vornehmen
        </Button>
      }
    >
      <TournamentTeamForm
        defaultValues={{
          name: tournamentTeam.name,
          members: tournamentTeam.members.map((member) => member.name),
          captain: tournamentTeam.captain ?? undefined
        }}
        submitButton={{ label: 'Änderungen speichern' }}
        actionConfig={{
          mode: 'client',
          action: async (
            values: z.infer<typeof TournamentTeamSchema>
          ): Promise<ActionState> => {
            try {
              await mutation.mutateAsync(values)

              return {
                success: true,
                message: 'Das Team wurde erfolgreich bearbeitet'
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

export default ModifyTournamentTeamDialog
