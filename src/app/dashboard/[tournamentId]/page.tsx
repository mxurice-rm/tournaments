import TournamentView from './content'
import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'

const Page = async ({ params }: { params: Promise<{ tournamentId: string }> }) => {
  const { tournamentId } = await params;

  if(!validate(tournamentId)) {
    return <p>Invalid tournament id</p>
  }

  const tournament = await getTournamentByID(tournamentId)
  if(!tournament) {
    return <p>Tournament nicht gefunden</p>
  }

  return <TournamentView initialTournament={tournament} />
}

export default Page;