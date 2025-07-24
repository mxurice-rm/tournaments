import { withAuthentication } from '@/lib/api/utils'
import { patchMatchHandler } from '@/app/api/match/[matchId]/patch'

export const PATCH = withAuthentication(patchMatchHandler)
