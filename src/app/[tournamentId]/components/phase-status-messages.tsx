import { Tournament } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TournamentPhaseStatus } from '../helper'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTournamentPlayOffMatches } from '@/lib/api/mutations'
import { errorToast, successToast } from '@/lib/utils'

interface PhaseStatusMessagesProps {
  tournament: Tournament
  phaseStatus: TournamentPhaseStatus
  isLoggedIn: boolean
}

export const PhaseStatusMessages = ({
  tournament,
  phaseStatus,
  isLoggedIn
}: PhaseStatusMessagesProps) => {
  const router = useRouter()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (phase: string) => {
      return await createTournamentPlayOffMatches(tournament.id, phase)
    },
    onSuccess: () => {
      successToast('Spiele wurden erfolgreich erstellt')
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    },
    onError: () => {
      errorToast()
    }
  })

  if (tournament.matchPlan === null) {
    return (
      <div className="text-center space-y-2 py-5">
        <h3 className="text-2xl font-bold">Keine Spiele gefunden!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Für dieses Turnier wurde noch kein Spielplan erstellt.
        </p>
        {isLoggedIn && (
          <Button
            size="sm"
            className="px-5"
            onClick={() => router.push(`dashboard/${tournament.id}/matches`)}
          >
            <Plus />
            Spiele erstellen
          </Button>
        )}
      </div>
    )
  }

  if (phaseStatus.semifinalCompleted) {
    return (
      <div className="text-center space-y-2 py-5">
        <h3 className="text-2xl font-bold">Halbfinale beendet!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Das Halbfinale ist abgeschlossen. Das Finale kann nun beginnen.
        </p>
        {isLoggedIn && (
          <Button
            size="sm"
            className="px-5"
            onClick={() => mutation.mutateAsync('final')}
          >
            <Plus />
            Final Spiel erstellen
          </Button>
        )}
      </div>
    )
  }

  if (phaseStatus.groupPhaseCompleted) {
    return (
      <div className="text-center space-y-2 py-5">
        <h3 className="text-2xl font-bold">Gruppenphase beendet!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Alle Spiele der Gruppenphase sind abgeschlossen. Die Playoff-Phase
          kann nun beginnen.
        </p>
        {isLoggedIn && (
          <Button
            size="sm"
            className="px-5"
            onClick={() => mutation.mutateAsync('semifinal')}
          >
            <Plus />
            Halbfinal Spiele erstellen
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="text-center space-y-2 py-5">
      <h3 className="text-2xl font-bold">Keine aktiven Spiele</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Momentan laufen keine Spiele.
      </p>
    </div>
  )
}
