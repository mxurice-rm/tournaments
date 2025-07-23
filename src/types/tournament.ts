export type Member = {
  id: number
  name: string
  teamId: string
}

export type TournamentTeam = {
  id: string
  name: string
  captain: string | null
  tournamentId: string
  members: Member[]
}

export type Tournament = {
  id: string
  name: string
  date: Date
  description: string
  location: string
  type: 'table' | 'bracket'
  teams: TournamentTeam[]
  matchPlan: MatchPlan | null
}

export type TournamentMatch = {
  id: string
  tournamentId: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
  phase: 'group' | 'semifinal' | 'final'
  status: 'scheduled' | 'in_progress' | 'completed'
  matchNumber: number
  roundNumber: number
  matchInRound: number
  tournamentGroup?: string | null
}

export type TournamentRound = {
  roundNumber: number
  matches: TournamentMatch[]
  isComplete: boolean
}

export type MatchPlan = {
  rounds: TournamentRound[]
  totalMatches: number
  totalRounds: number
}