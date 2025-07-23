'use client'

import { Tournament } from '@/types'
import { fetchTournament } from '@/lib/api/queries'
import { useQuery } from '@tanstack/react-query'
import PageContainer from '@/components/common/page/page-container'
import { Trophy } from 'lucide-react'
import React from 'react'
import TournamentInformation from '@/components/feature/tournament/tournament-information'
import TournamentTeamList from '@/components/feature/tournament-team/tournament-team-list'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'

const TournamentView = ({
  initialTournament
}: {
  initialTournament: Tournament
}) => {
  const { data: tournament } = useQuery<Tournament>({
    queryKey: [initialTournament.id],
    queryFn: () => fetchTournament(initialTournament.id),
    initialData: initialTournament,
    refetchOnWindowFocus: false
  })

  const router = useRouter()
  const pathname = usePathname()

  return (
    <PageContainer
      title="Turnierverwaltung"
      description="Hier kann das ausgewählte Turnier verwaltet werden."
      icon={<Trophy />}
    >
      <TournamentInformation tournament={tournament} />
      <TournamentTeamList tournament={tournament} />

      {tournament.teams.length !== 0 && (
        <Button
          onClick={() => router.push(`${pathname}/matches`)}
          className="w-full"
        >
          Spielplan anzeigen
        </Button>
      )}
    </PageContainer>
  )
}

export default TournamentView
