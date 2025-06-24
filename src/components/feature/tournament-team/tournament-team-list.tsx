import { Tournament } from '@/types'
import BoxGrid from '@/components/common/box-grid'
import TournamentTeamCard from '@/components/feature/tournament-team/tournament-team-card'
import PageSection from '@/components/common/page/page-section'
import { Users } from 'lucide-react'
import CreateTournamentTeamDialog from '@/components/feature/tournament-team/dialog/create-tournament-team-dialog'
import EmptyTournamentsTeams from '@/components/feature/tournament-team/empty-tornament-teams'

const TournamentTeamList = ({ tournament }: { tournament: Tournament }) => {
  return (
    <PageSection
      title="Teamverwaltung"
      headerAdditional={
        <div className="flex gap-3">
          {tournament.teams.length !== 0 && (<CreateTournamentTeamDialog tournament={tournament} />)}
          <div className="flex flex-1 items-center justify-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-md">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gray-300">
              {tournament.teams.length} Teams
            </span>
          </div>
        </div>
      }
    >
      {tournament.teams.length === 0 ? (
        <EmptyTournamentsTeams>
          <CreateTournamentTeamDialog tournament={tournament} />
        </EmptyTournamentsTeams>
      ) : (
        <BoxGrid>
          {tournament.teams?.map((team) => (
            <TournamentTeamCard key={team.id} team={team} />
          ))}
        </BoxGrid>
      )}
    </PageSection>
  )
}

export default TournamentTeamList
