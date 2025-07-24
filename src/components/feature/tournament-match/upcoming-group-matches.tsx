import { Badge } from '@/components/ui/badge'
import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import EditableMatchCard from '@/components/feature/tournament-match/editable-match-card'
import { useMemo } from 'react'

interface UpcomingGroupMatchesProps {
  group: string
  upcomingRounds: Array<{
    round: TournamentRound
    matches: TournamentMatch[]
  }>
  tournament: Tournament
}

interface RoundIndicatorProps {
  roundNumber: number
  isNext: boolean
}

const RoundIndicator = ({ roundNumber, isNext }: RoundIndicatorProps) => (
  <h4 className="font-medium text-sm text-muted-foreground border-l-2 border-primary pl-2">
    Runde {roundNumber}
    {isNext && (
      <Badge className="ml-2 text-xs" variant="secondary">
        Als nächstes
      </Badge>
    )}
  </h4>
)

const UpcomingGroupMatches = ({
  group,
  upcomingRounds,
  tournament
}: UpcomingGroupMatchesProps) => {
  const { totalMatches, nextMatch } = useMemo(() => {
    const total = upcomingRounds.reduce(
      (sum, { matches }) => sum + matches.length,
      0
    )
    const next = upcomingRounds[0]?.matches[0] || null
    
    return { totalMatches: total, nextMatch: next }
  }, [upcomingRounds])

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        Gruppe {group}
        <Badge variant="outline">{totalMatches} Spiele</Badge>
      </h3>
      {upcomingRounds.length > 0 ? (
        <div className="space-y-6">
          {upcomingRounds.map(({ round, matches }, roundIndex) => {
            const isNextRound = roundIndex === 0
            
            return (
              <div key={round.roundNumber} className="space-y-3">
                <RoundIndicator 
                  roundNumber={round.roundNumber} 
                  isNext={isNextRound} 
                />
                <div className="space-y-3">
                  {matches.map((match) => {
                    const isNextMatch = nextMatch && match.id === nextMatch.id
                    
                    return (
                      <div key={match.id} className="relative">
                        {isNextMatch && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                        )}
                        <EditableMatchCard
                          tournament={tournament}
                          match={{ ...match, roundNumber: round.roundNumber }}
                          isCurrentRound={false}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Keine weiteren Spiele für Gruppe {group}
        </p>
      )}
    </div>
  )
}

export { UpcomingGroupMatches }
export default UpcomingGroupMatches
