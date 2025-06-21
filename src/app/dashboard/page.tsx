'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import TournamentOverview from '@/app/dashboard/content'
import { getTournaments } from '@/lib/database/tournament'

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/sign-in')
  }

  const tournaments = await getTournaments()

  return <TournamentOverview initialTournaments={tournaments} />
}

export default Page
