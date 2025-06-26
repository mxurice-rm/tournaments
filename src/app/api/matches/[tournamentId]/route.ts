import { withAuthentication } from '@/lib/api/utilts'
import { postTournamentMatchHandler } from '@/app/api/matches/[tournamentId]/post'

export const POST = withAuthentication(postTournamentMatchHandler)
