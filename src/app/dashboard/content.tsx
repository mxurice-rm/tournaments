"use client"

import { Tournament } from '@/types'
import PageContainer from '@/components/common/page/page-container'
import { Trophy } from 'lucide-react'
import PageSection from '@/components/common/page/page-section'
import { useQuery } from '@tanstack/react-query'
import { fetchTournaments } from '@/lib/api/queries'
import TournamentCard from '@/components/feature/tournament/tournament-card'
import EmptyTournaments from '@/components/feature/tournament/empty-tournaments'
import CreateTournamentDialog from '@/components/feature/tournament/dialog/create-tournament-dialog'
import BoxGrid from '@/components/common/box-grid'

const TournamentOverview = ({
  initialTournaments
}: {
  initialTournaments: Tournament[]
}) => {
  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: fetchTournaments,
    initialData: initialTournaments,
    refetchOnWindowFocus: false
  })

  return (
    <PageContainer
      title="Turniere"
      description="Übersicht über alle aktuellen Turniere"
      icon={<Trophy />}
    >
      <PageSection
        title="Turniere verwalten"
        headerAdditional={tournaments.length !== 0 && <CreateTournamentDialog />}
      >
        {tournaments.length > 0 ? (
          <BoxGrid>
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </BoxGrid>
        ) : (
          <EmptyTournaments>
            <CreateTournamentDialog />
          </EmptyTournaments>
        )}
      </PageSection>
    </PageContainer>
  )
}

export default TournamentOverview
