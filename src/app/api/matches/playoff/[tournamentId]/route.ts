import { withAuthentication } from '@/lib/api/utils'
import { postTournamentPlayoffHandler } from '@/app/api/matches/playoff/[tournamentId]/post'

export const POST = withAuthentication(postTournamentPlayoffHandler)
