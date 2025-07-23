import { validate } from 'uuid'
import { getTournamentByID } from '@/lib/database/tournament'
import TournamentPublicView from '@/app/[tournamentId]/content'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'

const Page = async ({
  params
}: {
  params: Promise<{ tournamentId: string }>
}) => {
  const { tournamentId } = await params

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!validate(tournamentId)) {
    return <p>Invalid tournament id</p>
  }

  const tournament = await getTournamentByID(tournamentId)
  if (!tournament) {
    return <p>Tournament nicht gefunden</p>
  }

  return <TournamentPublicView initialTournament={tournament} loggedIn={session !== null} />
}

export default Page
