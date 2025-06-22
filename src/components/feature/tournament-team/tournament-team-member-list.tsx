import PageSection from '@/components/common/page/page-section'
import { TournamentTeam } from '@/types'
import { User, Users } from 'lucide-react'

const TournamentTeamMemberList = ({
  tournamentTeam
}: {
  tournamentTeam: TournamentTeam
}) => {
  return (
    <PageSection title="Teammitglieder" headerAdditional={null}>
      {tournamentTeam.members.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground flex flex-col gap-2">
          <Users className="h-12 w-12 mx-auto opacity-50" />
          <p>Keine Mitglieder vorhanden</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tournamentTeam.members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center p-3 px-5 rounded-md border border-white/10 bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm"
            >
              <div className="flex gap-5 items-center">
                <div className="p-2 bg-primary/20 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {member.name}</div>
              <div className="w-3 h-3 rounded-full bg-green-500" title="Aktiv" />
            </div>
          ))}
        </div>
      )}
    </PageSection>
  )
}

export default TournamentTeamMemberList
