import { Tournament } from '@/types'
import {fetchJson} from "@/lib/utils";

export const fetchTournaments = async (): Promise<Tournament[]> => {
  const data = await fetchJson<{ tournaments: Tournament[] }>('/api/tournament')
  return data.tournaments.map((t) => ({ ...t, date: new Date(t.date) }))
}

export const fetchTournament = async (id: string): Promise<Tournament> => {
  const data = await fetchJson<{ tournament: Tournament }>(
    `/api/tournament/${id}`
  )
  return { ...data.tournament, date: new Date(data.tournament.date) }
}