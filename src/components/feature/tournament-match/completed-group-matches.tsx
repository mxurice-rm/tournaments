import { Tournament, TournamentMatch } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import EditableMatchCard from '@/components/feature/tournament-match/editable-match-card'
import { useState, useMemo } from 'react'

type TournamentPhase = 'all' | 'group' | 'semifinal' | 'final'

interface CompletedGroupMatchesProps {
  group: string
  loggedIn?: boolean
  matches: TournamentMatch[]
  tournament: Tournament
}

interface PhaseStats {
  all: number
  group: number
  semifinal: number
  final: number
}

interface MatchesByRound {
  [roundNumber: number]: TournamentMatch[]
}

const getMatchPhase = (match: TournamentMatch): TournamentPhase => {
  switch (match.phase) {
    case 'group': return 'group'
    case 'semifinal': return 'semifinal'
    case 'final': return 'final'
    default: return 'group'
  }
}

const phaseLabels: Record<TournamentPhase, string> = {
  all: 'Alle',
  group: 'Gruppenphase',
  semifinal: 'Halbfinale',
  final: 'Finale'
}

const CompletedGroupMatches = ({
  group,
  matches,
  tournament,
  loggedIn = false
}: CompletedGroupMatchesProps) => {
  const [selectedPhase, setSelectedPhase] = useState<TournamentPhase>('all')

  const { filteredMatches, matchesByRound, sortedRounds, phaseStats } = useMemo(() => {
    const filtered = selectedPhase === 'all'
      ? matches
      : matches.filter((match) => getMatchPhase(match) === selectedPhase)

    const byRound = filtered.reduce<MatchesByRound>(
      (acc, match) => {
        const roundNum = match.roundNumber ?? 0
        if (!acc[roundNum]) {
          acc[roundNum] = []
        }
        acc[roundNum].push(match)
        return acc
      },
      {}
    )

    const sorted = Object.keys(byRound)
      .map(Number)
      .sort((a, b) => b - a)

    const stats: PhaseStats = {
      all: matches.length,
      group: matches.filter((m) => getMatchPhase(m) === 'group').length,
      semifinal: matches.filter((m) => getMatchPhase(m) === 'semifinal').length,
      final: matches.filter((m) => getMatchPhase(m) === 'final').length
    }

    return {
      filteredMatches: filtered,
      matchesByRound: byRound,
      sortedRounds: sorted,
      phaseStats: stats
    }
  }, [matches, selectedPhase])

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

        <div className="flex flex-wrap gap-2">
          {(Object.keys(phaseLabels) as TournamentPhase[]).map((phase) => {
            const isActive = selectedPhase === phase
            const count = phaseStats[phase]
            
            return (
              <Button
                key={phase}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPhase(phase)}
                className="h-8"
                disabled={count === 0}
              >
                {phaseLabels[phase]}
                {count > 0 && (
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className="ml-2 h-4 text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            )
          })}
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
