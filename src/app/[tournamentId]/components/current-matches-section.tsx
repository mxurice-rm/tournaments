import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import EditableMatchCard from '@/components/feature/tournament-match/editable-match-card'
import { TournamentPhaseStatus } from '../helper'

interface CurrentMatchesSectionProps {
  tournament: Tournament
  currentRoundMatches: TournamentMatch[]
  currentRound: TournamentRound | undefined
  phaseStatus: TournamentPhaseStatus
  canEndRound: boolean
  isLoggedIn: boolean
  onEndRound: () => Promise<void>
  isEndingRound: boolean
}

export const CurrentMatchesSection = ({
  tournament,
  currentRoundMatches,
  currentRound,
  phaseStatus,
  canEndRound,
  isLoggedIn,
  onEndRound,
  isEndingRound
}: CurrentMatchesSectionProps) => {
  const getRoundTitle = () => {
    if (phaseStatus.groupPhaseCompleted && !phaseStatus.semifinalCompleted) {
      return (
        <>
          <h3 className="text-xl font-semibold">Halbfinale</h3>
          <Badge className="text-xs">Spiele laufen parallel</Badge>
        </>
      )
    } else if (!phaseStatus.groupPhaseCompleted) {
      return (
        <>
          <h3 className="text-xl font-semibold">
            Runde {currentRound?.roundNumber}
          </h3>
          <Badge className="text-xs">Spiele laufen parallel</Badge>
        </>
      )
    }
    return null
  }

  const getEndRoundButtonText = () => {
    const isFinal = currentRoundMatches.some((match) => match.phase === 'final')
    
    if (isEndingRound) {
      return isFinal ? 'Turnier wird beendet...' : 'Runde wird beendet...'
    }
    
    if (canEndRound) {
      return isFinal ? 'Turnier beenden' : 'Runde beenden'
    }
    
    return 'Runde beenden (Ergebnisse fehlen)'
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-5 mb-3">
        {getRoundTitle()}
      </div>

      <div
        className={`gap-4 ${
          currentRoundMatches.some((match) => match.phase === 'final')
            ? 'flex justify-center'
            : 'grid grid-cols-1 md:grid-cols-2'
        }`}
      >
        {currentRoundMatches.map((match) => (
          <div
            key={match.id}
            className={match.phase === 'final' ? 'w-full max-w-3xl' : ''}
          >
            <EditableMatchCard
              isLoggedIn={isLoggedIn}
              tournament={tournament}
              match={match}
              isCurrentRound={true}
              headerTitle={match.phase === 'final' ? '🏆 FINALE' : undefined}
            />
          </div>
        ))}
      </div>

      {isLoggedIn && (
        <Button
          className="w-full"
          size="sm"
          onClick={onEndRound}
          disabled={!canEndRound || isEndingRound}
          variant={canEndRound ? 'default' : 'secondary'}
        >
          {getEndRoundButtonText()}
        </Button>
      )}
    </div>
  )
}