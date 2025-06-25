import {
  MatchPlan,
  Tournament,
  TournamentMatch,
  TournamentRound,
  TournamentTeam,
} from '@/types'
import { database } from '@/database'
import { matches } from '@/database/schema'

const buildMatch = (
  tournamentId: string,
  roundNumber: number,
  matchNumber: number,
  matchInRound: number,
  team1: TournamentTeam,
  team2: TournamentTeam,
): TournamentMatch => ({
  id: crypto.randomUUID(),
  tournamentId,
  homeTeamId: team1.id,
  awayTeamId: team2.id,
  homeScore: null,
  awayScore: null,
  phase: 'group',
  status: 'scheduled',
  matchNumber,
  roundNumber,
  matchInRound,
  tournamentGroup: null,
  homeTeam: team1,
  awayTeam: team2,
})

const registerTeamsForRound = (
  team1: TournamentTeam,
  team2: TournamentTeam,
  roundNumber: number,
  usedTeams: Set<string>,
  teamLastRound: Map<string, number>,
) => {
  usedTeams.add(team1.id)
  usedTeams.add(team2.id)
  teamLastRound.set(team1.id, roundNumber)
  teamLastRound.set(team2.id, roundNumber)
}

export const createMatchPlan = (
  tournament: Tournament,
  maxParallelGames = 2
): MatchPlan => {
  if (tournament.teams.length < 2) {
    return { rounds: [], totalMatches: 0, totalRounds: 0 };
  }

  const teams = [...tournament.teams];
  const allMatchPairs: [TournamentTeam, TournamentTeam][] = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      allMatchPairs.push([teams[i], teams[j]]);
    }
  }

  const rounds: TournamentRound[] = [];
  const remainingMatches = [...allMatchPairs];
  const teamLastRound = new Map<string, number>();
  let globalMatchNumber = 1;

  teams.forEach(team => teamLastRound.set(team.id, 0));

  while (remainingMatches.length > 0) {
    const currentRoundNumber = rounds.length + 1;
    const currentRoundMatches: TournamentMatch[] = [];
    const usedTeamsThisRound = new Set<string>();

    remainingMatches.sort((a, b) => {
      const [team1A, team2A] = a;
      const [team1B, team2B] = b;

      const pauseA = Math.min(
        currentRoundNumber - (teamLastRound.get(team1A.id) || 0),
        currentRoundNumber - (teamLastRound.get(team2A.id) || 0)
      );

      const pauseB = Math.min(
        currentRoundNumber - (teamLastRound.get(team1B.id) || 0),
        currentRoundNumber - (teamLastRound.get(team2B.id) || 0)
      );

      if (pauseA !== pauseB) {
        return pauseB - pauseA;
      }

      const gamesA = countGamesPlayed(team1A.id, team2A.id, rounds);
      const gamesB = countGamesPlayed(team1B.id, team2B.id, rounds);

      return gamesA - gamesB;
    });

    for (
      let i = 0;
      i < remainingMatches.length && currentRoundMatches.length < maxParallelGames;
      i++
    ) {
      const [team1, team2] = remainingMatches[i];

      if (!usedTeamsThisRound.has(team1.id) && !usedTeamsThisRound.has(team2.id)) {
        const match = buildMatch(
          tournament.id,
          currentRoundNumber,
          globalMatchNumber,
          currentRoundMatches.length + 1,
          team1,
          team2,
        );

        currentRoundMatches.push(match);
        registerTeamsForRound(team1, team2, currentRoundNumber, usedTeamsThisRound, teamLastRound);
        remainingMatches.splice(i, 1);
        globalMatchNumber++;
        i--;
      }
    }

    if (currentRoundMatches.length === 0 && remainingMatches.length > 0) {
      const [team1, team2] = remainingMatches[0];
      const match = buildMatch(
        tournament.id,
        currentRoundNumber,
        globalMatchNumber,
        1,
        team1,
        team2,
      );
      currentRoundMatches.push(match);
      registerTeamsForRound(team1, team2, currentRoundNumber, usedTeamsThisRound, teamLastRound);
      remainingMatches.splice(0, 1);
      globalMatchNumber++;
    }

    if (currentRoundMatches.length > 0) {
      const round: TournamentRound = {
        roundNumber: currentRoundNumber,
        matches: currentRoundMatches,
        isComplete: false,
      };
      rounds.push(round);
    }
  }

  return {
    rounds,
    totalMatches: allMatchPairs.length,
    totalRounds: rounds.length,
  };
};

const countGamesPlayed = (team1Id: string, team2Id: string, rounds: TournamentRound[]): number => {
  let count = 0;
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.homeTeamId === team1Id || match.awayTeamId === team1Id ||
        match.homeTeamId === team2Id || match.awayTeamId === team2Id) {
        count++;
      }
    }
  }
  return count;
};

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