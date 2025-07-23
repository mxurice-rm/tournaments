import {
  ArrowRight,
  Calendar,
  FileText,
  MapPin,
  Tag,
  Trophy,
  Users
} from 'lucide-react'
import React from 'react'
import { Tournament } from '@/types'
import { Button } from '@/components/ui/button'
import { tournamentTypeMapping } from '@/lib/utils'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

export const TournamentDetail = ({
  icon,
  detail
}: {
  icon: React.ReactElement<{ className?: string }>
  detail: string
}) => {
  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="w-4 h-4 flex-shrink-0">
        {React.cloneElement(icon, { className: 'h-full w-full text-primary' })}
      </div>

      <span className="line-clamp-2 overflow-hidden text-ellipsis">
        {detail}
      </span>
    </div>
  )
}

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg leading-tight">
            {tournament.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 bg-secondary-foreground/5 rounded-md">
          <Users className="h-3 w-3 text-primary" />
          <span className="text-xs font-medium text-secondary-foreground">
            {tournament.teams?.length || 0} Teams
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <TournamentDetail
          icon={<Calendar />}
          detail={tournament.date.toLocaleDateString('de-DE')}
        />
        <TournamentDetail icon={<MapPin />} detail={tournament.location} />
        <TournamentDetail
          icon={<Tag />}
          detail={tournamentTypeMapping[tournament.type]}
        />
        <TournamentDetail icon={<FileText />} detail={tournament.description} />
      </div>

      <Link href={`/dashboard/${tournament.id}`}>
        <Button variant="outline" className="w-full">
          Turnier verwalten
          <ArrowRight />
        </Button>
      </Link>
    </Card>
  )
}

export default TournamentCard
