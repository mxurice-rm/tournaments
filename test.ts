// Optimierte Turnier-Generierung mit besserer Team-Verteilung
import { Tournament, TournamentMatch, TournamentRound, TournamentTeam } from '@/types'
import { generateTableMatchPlan } from '@/lib/services/matches'


const generateOptimizedTableMatches = (tournament: Tournament, maxParallelGames = 2): TournamentResult<GeneratedTournament> => {
  if (tournament.teams.length < 2) {
    return { error: 'Mindestens 2 Teams erforderlich' }
  }

  // Alle möglichen Matches generieren
  const allMatchPairs: [TournamentTeam, TournamentTeam][] = []
  for (let i = 0; i < tournament.teams.length; i++) {
    for (let j = i + 1; j < tournament.teams.length; j++) {
      allMatchPairs.push([tournament.teams[i], tournament.teams[j]])
    }
  }

  const rounds: TournamentRound[] = []
  const remainingMatches = [...allMatchPairs]
  let globalMatchNumber = 1

  // Tracking: Wann hat jedes Team zuletzt gespielt
  const lastPlayedRound = new Map<string, number>()
  tournament.teams.forEach(team => lastPlayedRound.set(team.id, -1))

  while (remainingMatches.length > 0) {
    const currentRoundMatches: TournamentMatch[] = []
    const usedTeams = new Set<string>()
    const currentRoundNumber = rounds.length + 1

    // Matches nach "Pause seit letztem Spiel" sortieren
    remainingMatches.sort((a, b) => {
      const [team1A, team2A] = a
      const [team1B, team2B] = b

      // Berechne minimale Pause seit letztem Spiel für beide Teams
      const minPauseA = Math.min(
        currentRoundNumber - (lastPlayedRound.get(team1A.id) || -1),
        currentRoundNumber - (lastPlayedRound.get(team2A.id) || -1)
      )
      const minPauseB = Math.min(
        currentRoundNumber - (lastPlayedRound.get(team1B.id) || -1),
        currentRoundNumber - (lastPlayedRound.get(team2B.id) || -1)
      )

      // Teams mit längerer Pause haben Priorität
      return minPauseB - minPauseA
    })

    // Matches für diese Runde auswählen
    for (let i = 0; i < remainingMatches.length && currentRoundMatches.length < maxParallelGames; i++) {
      const [team1, team2] = remainingMatches[i]

      if (!usedTeams.has(team1.id) && !usedTeams.has(team2.id)) {
        const match: TournamentMatch = {
          id: 1,
          tournamentId: tournament.id,
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          homeScore: null,
          awayScore: null,
          phase: 'group',
          status: 'scheduled',
          matchNumber: globalMatchNumber,
          roundNumber: currentRoundNumber,
          matchInRound: currentRoundMatches.length + 1,
          tournamentGroup: null,
          homeTeam: team1,
          awayTeam: team2
        }

        currentRoundMatches.push(match)
        usedTeams.add(team1.id)
        usedTeams.add(team2.id)

        // Update "zuletzt gespielt" für beide Teams
        lastPlayedRound.set(team1.id, currentRoundNumber)
        lastPlayedRound.set(team2.id, currentRoundNumber)

        remainingMatches.splice(i, 1)
        globalMatchNumber++
        i-- // Index anpassen
      }
    }

    if (currentRoundMatches.length > 0) {
      const round: TournamentRound = {
        roundNumber: currentRoundNumber,
        matches: currentRoundMatches,
        isComplete: false,
      }
      rounds.push(round)
    }
  }

  return {
    rounds,
    totalMatches: allMatchPairs.length,
    totalRounds: rounds.length
  }
}

// Analyse-Funktion: Wie oft spielt jedes Team hintereinander?
const analyzeTeamDistribution = (generatedTournament) => {
  const teamStats = new Map<string, {
    name: string,
    totalGames: number,
    consecutiveStreak: number,
    maxConsecutiveStreak: number,
    roundsPlayed: number[]
  }>()

  // Initialize stats
  generatedTournament.rounds[0]?.matches.forEach(match => {
    if (match.homeTeam && !teamStats.has(match.homeTeam.id)) {
      teamStats.set(match.homeTeam.id, {
        name: match.homeTeam.name,
        totalGames: 0,
        consecutiveStreak: 0,
        maxConsecutiveStreak: 0,
        roundsPlayed: []
      })
    }
    if (match.awayTeam && !teamStats.has(match.awayTeam.id)) {
      teamStats.set(match.awayTeam.id, {
        name: match.awayTeam.name,
        totalGames: 0,
        consecutiveStreak: 0,
        maxConsecutiveStreak: 0,
        roundsPlayed: []
      })
    }
  })

  // Analyze each round
  generatedTournament.rounds.forEach(round => {
    const teamsInThisRound = new Set<string>()

    round.matches.forEach(match => {
      // Count games
      const homeStats = teamStats.get(match.homeTeamId)
      const awayStats = teamStats.get(match.awayTeamId)

      if (homeStats) {
        homeStats.totalGames++
        homeStats.roundsPlayed.push(round.roundNumber)
        teamsInThisRound.add(match.homeTeamId)
      }
      if (awayStats) {
        awayStats.totalGames++
        awayStats.roundsPlayed.push(round.roundNumber)
        teamsInThisRound.add(match.awayTeamId)
      }
    })

    // Update consecutive streaks
    teamStats.forEach((stats, teamId) => {
      if (teamsInThisRound.has(teamId)) {
        stats.consecutiveStreak++
        stats.maxConsecutiveStreak = Math.max(stats.maxConsecutiveStreak, stats.consecutiveStreak)
      } else {
        stats.consecutiveStreak = 0
      }
    })
  })

  return teamStats
}

// Vergleichsfunktion zwischen Standard und optimiert
const compareTournamentAlgorithms = (tournament: Tournament, maxParallelGames = 2) => {
  console.log('=== ALGORITHMUS-VERGLEICH ===\n')

  // Standard-Algorithmus (der ursprüngliche)
  const standard = generateTableMatchPlan(tournament, maxParallelGames)

  // Optimierter Algorithmus
  const optimized = generateOptimizedTableMatches(tournament, maxParallelGames)

  console.log('STANDARD-ALGORITHMUS:')
  const standardStats = analyzeTeamDistribution(standard)
  let maxConsecutiveStandard = 0
  standardStats.forEach(stats => {
    maxConsecutiveStandard = Math.max(maxConsecutiveStandard, stats.maxConsecutiveStreak)
    console.log(`${stats.name}: Max ${stats.maxConsecutiveStreak} Runden hintereinander`)
  })

  console.log('\nOPTIMIERTER ALGORITHMUS:')
  const optimizedStats = analyzeTeamDistribution(optimized)
  let maxConsecutiveOptimized = 0
  optimizedStats.forEach(stats => {
    maxConsecutiveOptimized = Math.max(maxConsecutiveOptimized, stats.maxConsecutiveStreak)
    console.log(`${stats.name}: Max ${stats.maxConsecutiveStreak} Runden hintereinander`)
  })

  console.log(`\n📊 VERBESSERUNG:`)
  console.log(`Standard: Max ${maxConsecutiveStandard} aufeinanderfolgende Runden`)
  console.log(`Optimiert: Max ${maxConsecutiveOptimized} aufeinanderfolgende Runden`)
  console.log(`Verbesserung: ${maxConsecutiveStandard - maxConsecutiveOptimized} Runden weniger`)
}

// Test mit 9 Teams
const testTournament: Tournament = {
  id: 'test-tournament',
  name: 'Test Tournament',
  date: new Date(),
  description: 'Test',
  location: 'Test Location',
  type: 'table',
  teams: Array.from({ length: 9 }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Team ${i + 1}`,
    captain: null,
    tournamentId: 'test-tournament',
    members: []
  }))
}

// Vergleich ausführen
compareTournamentAlgorithms(testTournament, 2)

export {
  generateOptimizedTableMatches,
  analyzeTeamDistribution,
  compareTournamentAlgorithms
}