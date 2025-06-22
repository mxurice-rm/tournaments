import { getTournamentTeamHandler } from '@/app/api/team/[teamId]/get'
import { withAuthentication } from '@/lib/api/utilts'
import { patchTournamentTeamHandler } from '@/app/api/team/[teamId]/patch'
import { deleteTournamentTeamHandler } from '@/app/api/team/[teamId]/delete'

export const GET = (getTournamentTeamHandler)
export const PATCH = withAuthentication(patchTournamentTeamHandler)
export const DELETE = withAuthentication(deleteTournamentTeamHandler)