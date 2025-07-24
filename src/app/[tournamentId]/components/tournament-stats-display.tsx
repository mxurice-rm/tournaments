import { Tournament, TournamentMatch } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

interface TournamentStatsDisplayProps {
  tournament: Tournament
  completedMatches: TournamentMatch[]
  tournamentWinner: { teamName: string; teamId: string } | null
}

export const TournamentStatsDisplay = ({
  tournament,
  completedMatches,
  tournamentWinner
}: TournamentStatsDisplayProps) => {
  const maxRounds = Math.max(
    ...(tournament.matchPlan?.rounds?.map((r) => r.roundNumber) || [0])
  )

  const totalGoals = completedMatches.reduce(
    (sum, match) => sum + (match.homeScore || 0) + (match.awayScore || 0),
    0
  )

  return (
    <div className="text-center space-y-6 py-8">
      <div>
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Trophy className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Turnier abgeschlossen</h2>
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        </div>

        {tournamentWinner ? (
          <div className="space-y-6">
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Herzlichen Glückwunsch an{' '}
              <strong className="text-primary">
                {tournamentWinner.teamName}
              </strong>
              ! Das Team hat sich erfolgreich gegen alle Konkurrenten
              durchgesetzt und den Titel geholt.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground max-w-md mx-auto">
              Das Turnier ist vollständig abgeschlossen. Herzlichen
              Glückwunsch an alle Teilnehmer!
            </p>
            <Badge variant="outline" className="text-sm">
              Turnier komplett
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6">
          <div className="text-center p-4 border rounded-lg bg-card">
            <div className="text-2xl font-bold text-foreground">
              {tournament.teams.length}
            </div>
            <div className="text-sm text-muted-foreground">Teams</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-card">
            <div className="text-2xl font-bold text-foreground">
              {completedMatches.length}
            </div>
            <div className="text-sm text-muted-foreground">Spiele</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-card">
            <div className="text-2xl font-bold text-foreground">
              {totalGoals}
            </div>
            <div className="text-sm text-muted-foreground">Tore</div>
          </div>
          <div className="text-center p-4 border rounded-lg bg-card">
            <div className="text-2xl font-bold text-foreground">
              {maxRounds}
            </div>
            <div className="text-sm text-muted-foreground">Runden</div>
          </div>
        </div>
      </div>
    </div>
  )
}