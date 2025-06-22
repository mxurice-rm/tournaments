import PageSection from '@/components/common/page/page-section'
import { Hash, Trophy, Users } from 'lucide-react'
import React from 'react'
import { TournamentTeam } from '@/types'
import BoxGrid from '@/components/common/box-grid'
import InfoCard from '@/components/common/information-card'
import ModifyTournamentTeamDialog from '@/components/feature/tournament-team/dialog/modify-tournament-team-dialog'
import DeleteTournamentTeamDialog from '@/components/feature/tournament-team/dialog/delete-tournament-team-dialog'

const TournamentTeamInformation = ({
  tournamentTeam
}: {
  tournamentTeam: TournamentTeam
}) => {
  return (
    <PageSection
      title="Turnierinformationen"
      headerAdditional={
        <div className="flex gap-3">
          <DeleteTournamentTeamDialog tournamentTeam={tournamentTeam} />{' '}
          <ModifyTournamentTeamDialog tournamentTeam={tournamentTeam} />
        </div>
      }
    >
      <BoxGrid>
        <InfoCard title="name" icon={<Hash />} info={tournamentTeam.name} />
        <InfoCard
          title="Kapitän"
          icon={<Trophy />}
          info={tournamentTeam.captain || 'Kein Kapitän angegeben'}
        />
        <InfoCard
          title="Mitglieder"
          icon={<Users />}
          info={
            tournamentTeam.members.length > 0
              ? `${tournamentTeam.members.length} Mitglied${tournamentTeam.members.length === 1 ? '' : 'er'}`
              : 'Keine Mitglieder vorhanden'
          }
        />
      </BoxGrid>
    </PageSection>
  )
}

export default TournamentTeamInformation
