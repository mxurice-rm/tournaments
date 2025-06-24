import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTournament } from '@/lib/api/mutations'
import { Tournament } from '@/types'
import { useRouter } from 'next/navigation'
import BaseDeleteDialog from '@/components/common/dialog/delete-dialog'

const DeleteTournamentDialog = ({ tournament }: { tournament: Tournament }) => {
  const [open, setOpen] = useState(false)

  const router = useRouter()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteTournament(tournament.id),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['tournaments'] })
        .then(() => router.push('/dashboard'))
    }
  })

  return (
    <BaseDeleteDialog
      open={open}
      setOpen={setOpen}
      title="Turnier löschen"
      description="Bist du sicher, dass du dieses Turnier löschen möchtest? Dieser Vorgang kann nicht rückgänig gemacht werden."
      triggerButton={
        <Button size="sm" variant="destructive" className="flex-1">
          <Trash />
          Turnier löschen
        </Button>
      }
      action={async () => await mutation.mutateAsync()}
    />
  )
}

export default DeleteTournamentDialog
