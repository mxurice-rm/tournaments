import { withAuthentication } from '@/lib/api/utilts'
import { patchMatchHandler } from '@/app/api/match/[matchId]/patch'

export const PATCH = withAuthentication(patchMatchHandler)
