import BaseDialog from '@/components/common/base-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { DialogClose } from '@/components/ui/dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTournament } from '@/lib/api/mutations'
import { Tournament } from '@/types'
import { useRouter } from 'next/navigation'

const DeleteTournamentDialog = ({ tournament }: { tournament: Tournament }) => {
  const [open, setOpen] = useState(false)

  const router = useRouter()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteTournament(tournament.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] }).then(() => router.push('/dashboard'))
    }
  })

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title="Turnier löschen"
      description="Bist du sicher, dass du dieses Turnier löschen möchtest? Dieser Vorgang kann nicht rückgänig gemacht werden."
      triggerButton={
        <Button size="sm" variant="destructive">
          <Trash />
          Turnier löschen
        </Button>
      }
    >
      <div className="flex gap-3">
        <DialogClose asChild>
          <Button variant="outline" size="sm" className="flex-1">
            Abbrechen
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant="destructive" size="sm" className="flex-1" onClick={async () => await mutation.mutateAsync()}>
            Löschen
          </Button>
        </DialogClose>
      </div>
    </BaseDialog>
  )
}

export default DeleteTournamentDialog
