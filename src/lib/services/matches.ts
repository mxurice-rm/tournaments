import { MatchPlan, Tournament } from '@/types'
import { database } from '@/database'
import { matches } from '@/database/schema'
import { createTableMatchPlan, createBracketMatchPlan } from './match-generators'

export const createMatchPlan = (
  tournament: Tournament,
  maxParallelGames = 2
): MatchPlan => {
  if (tournament.type === 'bracket') {
    return createBracketMatchPlan(tournament)
  }

  return createTableMatchPlan(tournament, maxParallelGames)
}

const storeMatchPlan = async (matchPlan: MatchPlan) => {
  const allMatches = matchPlan.rounds.flatMap(round => round.matches)

  try {
    await database.insert(matches).values(allMatches)
    return { success: true, savedMatches: allMatches.length }
  } catch (error) {
    console.error('Database insert error:', error)
    return {
      success: false,
      error: new Error('Failed to save matches to the database')
    }
  }
}

export async function generateAndStoreMatches(tournament: Tournament) {
  const matchPlan = createMatchPlan(tournament)

  if (matchPlan.totalMatches === 0) {
    return {
      success: false,
      error: new Error('Tournament does not have enough teams to generate matches')
    }
  }

  matchPlan.rounds.forEach(round => {
    console.log(`\nRunde ${round.roundNumber}:`)
    round.matches.forEach(match => {
      console.log(`  Match ${match.matchInRound}: ${match.homeTeam?.name} vs ${match.awayTeam?.name}`)
    })
  })

  const result = await storeMatchPlan(matchPlan)
  if (!result.success) {
    return {
      success: false,
      error: result.error
    }
  }

  return { success: true, matchPlan }
}
