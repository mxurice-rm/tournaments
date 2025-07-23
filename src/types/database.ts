import { Member, Tournament, TournamentMatch, TournamentTeam } from '@/types/tournament'

export type Row = {
  tournaments?: Omit<Tournament, 'teams' | 'date' | 'matchPlan'> & { date: string };
  teams?: Omit<TournamentTeam, 'members'> | null;
  teamMembers?: Member | null;
  matches?: Omit<TournamentMatch, 'tournamentGroup'> & { tournamentGroup: string | null } | null;
}