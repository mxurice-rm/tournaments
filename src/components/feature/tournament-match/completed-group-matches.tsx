import { Tournament, TournamentMatch } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import EditableMatchCard from '@/components/feature/tournament-match/editable-match-card'
import { useState } from 'react'

type TournamentPhase = 'all' | 'group' | 'semifinal' | 'final'

const CompletedGroupMatches = ({
  group,
  matches,
  tournament,
  loggedIn = false
}: {
  group: string
  loggedIn?: boolean
  matches: TournamentMatch[]
  tournament: Tournament
}) => {
  const [selectedPhase, setSelectedPhase] = useState<TournamentPhase>('all')

  // Funktion um die Turnierphase eines Matches zu bestimmen
  const getMatchPhase = (match: TournamentMatch): TournamentPhase => {
    // Basierend auf tournamentGroup oder anderen Kriterien
    if (match.phase === 'group') {
      return 'group'
    }

    // Könnte basierend auf Rundennummer oder speziellem Flag bestimmt werden
    if (match.phase === 'semifinal') {
      return 'semifinal'
    }

    if (match.phase === 'final') {
      return 'final'
    }

    return 'group' // Default zu Gruppenphase
  }

  // Filtere Matches basierend auf ausgewählter Phase
  const filteredMatches =
    selectedPhase === 'all'
      ? matches
      : matches.filter((match) => getMatchPhase(match) === selectedPhase)

  // Gruppiere gefilterte Matches nach Runden
  const matchesByRound = filteredMatches.reduce(
    (acc, match) => {
      const roundNum = match.roundNumber
      if (!acc[roundNum]) {
        acc[roundNum] = []
      }
      acc[roundNum].push(match)
      return acc
    },
    {} as Record<number, TournamentMatch[]>
  )

  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => b - a)

  // Berechne Anzahl Matches pro Phase für Badges
  const phaseStats = {
    all: matches.length,
    group: matches.filter((m) => getMatchPhase(m) === 'group').length,
    semifinal: matches.filter((m) => getMatchPhase(m) === 'semifinal').length,
    final: matches.filter((m) => getMatchPhase(m) === 'final').length
  }

  const phaseLabels = {
    all: 'Alle',
    group: 'Gruppenphase',
    semifinal: 'Halbfinale',
    final: 'Finale'
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold">Gruppe {group}</h3>
          <Badge variant="outline" className="text-xs">
            {filteredMatches.length} von {matches.length} Spiel
            {matches.length === 1 ? '' : 'en'}
          </Badge>
        </div>

        {/* Phase Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(phaseLabels) as TournamentPhase[]).map((phase) => (
            <Button
              key={phase}
              variant={selectedPhase === phase ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPhase(phase)}
              className="h-8"
              disabled={phaseStats[phase] === 0}
            >
              {phaseLabels[phase]}
              {phaseStats[phase] > 0 && (
                <Badge
                  variant={selectedPhase === phase ? 'secondary' : 'outline'}
                  className="ml-2 h-4 text-xs"
                >
                  {phaseStats[phase]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {sortedRounds.length > 0 ? (
        <div className="space-y-6">
          {sortedRounds.map((roundNum) => (
            <div key={roundNum} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground border-l-2 border-primary pl-2">
                Runde {roundNum}
                <Badge variant="outline" className="ml-2 text-xs">
                  {phaseLabels[getMatchPhase(matchesByRound[roundNum][0])]}
                </Badge>
              </h4>
              <div className="space-y-3">
                {matchesByRound[roundNum]
                  .sort((a, b) => a.matchInRound - b.matchInRound)
                  .map((match) => (
                    <EditableMatchCard
                      key={match.id}
                      tournament={tournament}
                      match={match}
                      isCurrentRound={false}
                      isLoggedIn={loggedIn}
                      headerTitle={match.phase === 'semifinal' ? 'Halbfinale' : match.phase === 'final' ? 'Finale' : undefined}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {selectedPhase === 'all'
              ? `Noch keine gespielten Spiele in Gruppe ${group}`
              : `Keine Spiele in der ${phaseLabels[selectedPhase]} für Gruppe ${group}`}
          </p>
          {selectedPhase !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPhase('all')}
              className="mt-2"
            >
              Alle Spiele anzeigen
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default CompletedGroupMatches
