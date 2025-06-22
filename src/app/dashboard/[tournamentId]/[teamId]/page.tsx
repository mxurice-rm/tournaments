import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import TournamentTeamView from '@/app/dashboard/[tournamentId]/[teamId]/content'

const Page = async ({ params }: { params: Promise<{ tournamentId: string, teamId: string }> }) => {
  const { tournamentId, teamId } = await params;

  if(!validate(tournamentId) || !validate(teamId)) {
    return <p>Invalid tournament or team id</p>
  }

  const tournament = await getTournamentByID(tournamentId)
  if(!tournament) {
    return <p>Tournament nicht gefunden</p>
  }

  const tournamentTeam = tournament.teams?.find(t => t.id === teamId)
  if(!tournamentTeam) {
    return <p>Team nicht gefunden</p>
  }

  return <TournamentTeamView initialTeam={tournamentTeam} />
}

export default Page;