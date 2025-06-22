'use client'

import PageContainer from '@/components/common/page/page-container'
import { Users } from 'lucide-react'
import { TournamentTeam } from '@/types'
import TournamentTeamInformation from '@/components/feature/tournament-team/tournament-team-information'
import TournamentTeamMemberList from '@/components/feature/tournament-team/tournament-team-member-list'
import { useQuery } from '@tanstack/react-query'
import { fetchTournamentTeam } from '@/lib/api/queries'

const TournamentTeamView = ({
  initialTeam
}: {
  initialTeam: TournamentTeam
}) => {
  const { data: tournamentTeam } = useQuery<TournamentTeam>({
    queryKey: [initialTeam.id],
    queryFn: () => fetchTournamentTeam(initialTeam.id),
    initialData: initialTeam,
    refetchOnWindowFocus: false
  })

  return (
    <PageContainer
      title="Teamverwaltung"
      description={`Hier kann das Team "${tournamentTeam.name}" verwaltet / bearbeitet werden.`}
      icon={<Users />}
    >
      <TournamentTeamInformation tournamentTeam={tournamentTeam} />
      <TournamentTeamMemberList tournamentTeam={tournamentTeam} />
    </PageContainer>
  )
}

export default TournamentTeamView
