import { postTournamentTeamHandler } from '@/app/api/tournament/[tournamentId]/post'
import { getTournamentHandler } from '@/app/api/tournament/[tournamentId]/get'
import { patchTournamentHandler } from '@/app/api/tournament/[tournamentId]/patch'
import { withAuthentication } from '@/lib/api/utilts'
import { deleteTournamentHandler } from '@/app/api/tournament/[tournamentId]/delete'

export const POST = withAuthentication(postTournamentTeamHandler)
export const GET = withAuthentication(getTournamentHandler)
export const PATCH = withAuthentication(patchTournamentHandler)
export const DELETE = withAuthentication(deleteTournamentHandler)
