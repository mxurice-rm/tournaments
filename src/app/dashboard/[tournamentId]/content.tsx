"use client";

import { Tournament } from '@/types'
import { fetchTournament } from '@/lib/api/queries'
import { useQuery } from '@tanstack/react-query'
import PageContainer from '@/components/common/page/page-container'
import { Trophy } from 'lucide-react'
import React from 'react'
import TournamentInformation from '@/components/feature/tournament/tournament-information'
import TournamentTeamList from '@/components/feature/tournament-team/tournament-team-list'

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

  return (
    <PageContainer
      title="Turnierverwaltung"
      description="Hier kann das ausgewählte Turnier verwaltet werden."
      icon={<Trophy />}
    >
      <TournamentInformation tournament={tournament} />
      <TournamentTeamList tournament={tournament} />
    </PageContainer>
  )
}

export default TournamentView
