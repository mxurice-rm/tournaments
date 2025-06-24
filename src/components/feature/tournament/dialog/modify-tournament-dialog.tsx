import { useState } from 'react'
import BaseDialog from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import TournamentForm from '../forms/tournament-form'
import { ActionState, Tournament } from '@/types'
import { z } from 'zod'
import { TournamentSchema } from '@/lib/schemas'
import { updateTournament } from '@/lib/api/mutations'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const ModifyTournamentDialog = ({ tournament }: { tournament: Tournament }) => {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof TournamentSchema>) => {
      return await updateTournament(tournament.id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    }
  })

  return (
    <BaseDialog
      open={isOpen}
      setOpen={setIsOpen}
      title="Turnier bearbeiten"
      description="Hier können Änderungen über die allgemeinen Informationen des
            Turniers vorgenommen werden"
      triggerButton={
        <Button size="sm" className="flex-1">
          <Pencil />
          Änderungen vornehmen
        </Button>
      }
    >
      <TournamentForm
        submitButton={{ label: 'Änderungen speichern' }}
        defaultValues={{
          name: tournament.name,
          type: tournament.type,
          location: tournament.location,
          date: tournament.date,
          description: tournament.description
        }}
        onSuccess={() => {
          setIsOpen(false)
        }}
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

export default ModifyTournamentDialog
