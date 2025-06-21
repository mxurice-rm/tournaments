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
}