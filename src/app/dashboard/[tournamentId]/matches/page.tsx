import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import TournamentMatchPlanView from '@/app/dashboard/[tournamentId]/matches/content'

const Page = async ({
  params
}: {
  params: Promise<{ tournamentId: string }>
}) => {
  const { tournamentId } = await params

  if (!validate(tournamentId)) {
    return <p>Invalid tournament id</p>
  }

  const tournament = await getTournamentByID(tournamentId)
  if (!tournament) {
    return <p>Tournament nicht gefunden</p>
  }

  if(tournament.teams.length === 0) {
    return <p>Tournament has no teams</p>
  }

  return <TournamentMatchPlanView initialTournament={tournament} />
}

export default Page
