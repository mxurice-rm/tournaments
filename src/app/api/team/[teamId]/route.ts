import { getTournamentTeamHandler } from '@/app/api/team/[teamId]/get'
import { withAuthentication, withoutAuthentication } from '@/lib/api/utils'
import { patchTournamentTeamHandler } from '@/app/api/team/[teamId]/patch'
import { deleteTournamentTeamHandler } from '@/app/api/team/[teamId]/delete'

export const GET = withoutAuthentication(getTournamentTeamHandler)
export const PATCH = withAuthentication(patchTournamentTeamHandler)
export const DELETE = withAuthentication(deleteTournamentTeamHandler)