import PageSection from '@/components/common/page/page-section'
import { FileText, Hash, MapPin, Tag, Trophy, Calendar } from 'lucide-react'
import { tournamentTypeMapping } from '@/lib/utils'
import React from 'react'
import { Tournament } from '@/types'
import BoxGrid from '@/components/common/box-grid'
import ModifyTournamentDialog from '@/components/feature/tournament/dialog/modify-tournament-dialog'
import DeleteTournamentDialog from '@/components/feature/tournament/dialog/delete-tournament-dialog'

const InfoCard = ({
  title,
  info,
  icon
}: {
  title: string
  info: string | Date
  icon: React.ReactElement<{ className?: string }>
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-md border border-white/10 bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary/50">
          {React.isValidElement(icon) &&
            React.cloneElement(icon, {
              className: 'h-5 w-5 text-primary'
            })}
        </div>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
      <p className="font-medium line-clamp-1">
        {info instanceof Date ? new Date(info).toLocaleDateString() : info}
      </p>
    </div>
  )
}

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
