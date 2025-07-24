import { withAuthentication } from '@/lib/api/utils'
import { postTournamentMatchHandler } from '@/app/api/matches/[tournamentId]/post'
import { deleteTournamentMatchesHandler } from '@/app/api/matches/[tournamentId]/delete'

export const POST = withAuthentication(postTournamentMatchHandler)
export const DELETE = withAuthentication(deleteTournamentMatchesHandler)
