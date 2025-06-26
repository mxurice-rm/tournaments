import { MatchPlan, Tournament } from '@/types'
import { database } from '@/database'
import { matches } from '@/database/schema'
import { createTableMatchPlan, createBracketMatchPlan } from './match-generators'
import { getTournamentTeamByID } from '@/lib/database/tournament-team/queries'

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

  await (async () => {
    for (const round of matchPlan.rounds) {
      console.log(`\nRunde ${round.roundNumber}:`);

      // Erstelle ein Array von Promises für die Matches
      const matchPromises = round.matches.map(async (match) => {
        const team1 = await getTournamentTeamByID(match.homeTeamId);
        const team2 = await getTournamentTeamByID(match.awayTeamId);

        return `  Match ${match.matchInRound}: ${team1?.name} vs ${team2?.name} Gruppe: ${match.tournamentGroup}`;
      });

      // Warte, bis alle Promises aufgelöst sind
      const matchResults = await Promise.all(matchPromises);

      // Logge alle Ergebnisse für die Runde
      matchResults.forEach((result) => console.log(result));
    }
  })();


  const result = await storeMatchPlan(matchPlan)
  if (!result.success) {
    return {
      success: false,
      error: result.error
    }
  }

  return { success: true, matchPlan }
}
