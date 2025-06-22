import { TournamentTeam } from '@/types'
import { ArrowRight, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'
import BaseCard from '@/components/common/base-card'

const TournamentTeamCard = ({ team }: { team: TournamentTeam }) => {
  return (
    <BaseCard className="gap-3 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">{team.name}</h4>
            <p className="text-sm text-secondary-foreground/60">
              {team.members.length} Mitglied
              {team.members.length !== 1 ? 'er' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-start flex-col flex-1 gap-3">
        {team.captain && (
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm text-secondary-foreground/60">
              Kapitän: {team.captain}
            </span>
          </div>
        )}

        {team.members.length !== 0 && (
          <div className="space-y-1">
            <p className="text-xs text-secondary-foreground/40 uppercase tracking-wider">
              Mitglieder:
            </p>
            <div className="flex flex-wrap gap-1">
              {team.members.map((member, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-primary/5 text-gray-300 rounded-md"
                >
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <Link href={`/dashboard/${team.tournamentId}/${team.id}`}>
        <Button variant="outline" className="w-full">
          Team verwalten
          <ArrowRight />
        </Button>
      </Link>
    </BaseCard>
  )
}

export default TournamentTeamCard
