import { z } from 'zod'
import {
  TournamentMatchSchema,
  TournamentSchema,
  TournamentTeamSchema,
  TournamentTeamUpdateSchema
} from '@/lib/schemas'
import { fetchJson } from '@/lib/utils'

export const updateTournament = async (
  tournamentId: string,
  values: z.infer<typeof TournamentSchema>
): Promise<void> => {
  await fetchJson(`/api/tournament/${tournamentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
}

export const createTournamentTeam = async (
  tournamentId: string,
  values: z.infer<typeof TournamentTeamSchema>
): Promise<void> => {
  await fetchJson(`/api/tournament/${tournamentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
}

export const updateTournamentTeam = async (
  teamId: string,
  values: z.infer<typeof TournamentTeamUpdateSchema>
): Promise<void> => {
  await fetchJson(`/api/team/${teamId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
}

export const createTournament = async (
  values: z.infer<typeof TournamentSchema>
): Promise<void> => {
  await fetchJson(`/api/tournament`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
}

export const deleteTournament = async (tournamentId: string): Promise<void> => {
  await fetchJson(`/api/tournament/${tournamentId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
}

export const deleteTournamentTeam = async (teamId: string): Promise<void> => {
  await fetchJson(`/api/team/${teamId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
}

export const updateTournamentMatch = async (
  matchId: string,
  values: z.infer<typeof TournamentMatchSchema>
): Promise<void> => {
  await fetchJson(`/api/match/${matchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values)
  })
}
