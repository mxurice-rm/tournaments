import { Member, Tournament, TournamentTeam } from '@/types/tournament'

export type Row = {
  tournaments?: Omit<Tournament, 'teams' | 'date'> & { date: string };
  teams?: Omit<TournamentTeam, 'members'> | null;
  teamMembers?: Member | null;
}