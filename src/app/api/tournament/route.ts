import { withAuthentication } from '@/lib/api/utils'
import { postTournamentHandler } from '@/app/api/tournament/post'
import { getTournamentsHandler } from '@/app/api/tournament/get'

export const GET = getTournamentsHandler
export const POST = withAuthentication(postTournamentHandler)
