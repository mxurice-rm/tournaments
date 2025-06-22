import PageSection from '@/components/common/page/page-section'
import { FileText, Hash, MapPin, Tag, Trophy, Calendar } from 'lucide-react'
import { tournamentTypeMapping } from '@/lib/utils'
import React from 'react'
import { Tournament } from '@/types'
import BoxGrid from '@/components/common/box-grid'
import ModifyTournamentDialog from '@/components/feature/tournament/dialog/modify-tournament-dialog'
import DeleteTournamentDialog from '@/components/feature/tournament/dialog/delete-tournament-dialog'
import InfoCard from '@/components/common/information-card'

const TournamentInformation = ({ tournament }: { tournament: Tournament }) => {
  return (
    <PageSection
      title="Turnierinformationen"
      headerAdditional={
        <div className="flex gap-3">
          <DeleteTournamentDialog tournament={tournament} />
          <ModifyTournamentDialog tournament={tournament} />
        </div>
      }
    >
      <BoxGrid>
        <InfoCard title="ID" icon={<Hash />} info={tournament.id} />
        <InfoCard title="name" icon={<Trophy />} info={tournament.name} />
        <InfoCard title="datum" icon={<Calendar />} info={tournament.date} />
        <InfoCard
          title="beschreibung"
          icon={<FileText />}
          info={tournament.description}
        />
        <InfoCard title="ort" icon={<MapPin />} info={tournament.location} />
        <InfoCard
          title="typ"
          icon={<Tag />}
          info={tournamentTypeMapping[tournament.type]}
        />
      </BoxGrid>
    </PageSection>
  )
}

export default TournamentInformation
