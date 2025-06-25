import { MatchPlan, Tournament } from '@/types'

// TODO: Implement knockout bracket generation
export const createBracketMatchPlan = (
  tournament: Tournament
): MatchPlan => {
  return { rounds: [], totalMatches: 0, totalRounds: 0 }
}
