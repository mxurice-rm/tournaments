import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTournamentTeam } from '@/lib/api/mutations'
import { TournamentTeam } from '@/types'
import { useRouter } from 'next/navigation'
import BaseDeleteDialog from '@/components/common/dialog/delete-dialog'

const DeleteTournamentTeamDialog = ({
  tournamentTeam
}: {
  tournamentTeam: TournamentTeam
}) => {
  const [open, setOpen] = useState(false)

  const router = useRouter()

  const queryClient = useQueryClient()

  const tournamentIdRef = React.useRef<string | undefined>(
    tournamentTeam.tournamentId
  )

  const mutation = useMutation({
    mutationFn: () => deleteTournamentTeam(tournamentTeam.id),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [tournamentTeam.tournamentId] })
        .then(() => {
          if (tournamentIdRef.current) {
            router.push(`/dashboard/${tournamentIdRef.current}`)
          }
        })
    }
  })

  return (
    <BaseDeleteDialog
      open={open}
      setOpen={setOpen}
      title="Team löschen"
      description="Bist du sicher, dass du dieses Team löschen möchtest? Dieser Vorgang kann nicht rückgänig gemacht werden."
      triggerButton={
        <Button size="sm" variant="destructive" className="flex-1">
          <Trash />
          Team löschen
        </Button>
      }
      action={async () => mutation.mutateAsync()}
    />
  )
}

export default DeleteTournamentTeamDialog
