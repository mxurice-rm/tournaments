import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import PageSection from '@/components/common/page/page-section'
import { Zap, Play, AlertCircle, Trophy, Users, Calendar } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BoxGrid from '@/components/common/box-grid'

interface TournamentMatchManagementProps {
  tournament: Tournament
  matches?: TournamentRound[]
}

const TournamentMatchManagement = ({
  tournament,
  matches = []
}: TournamentMatchManagementProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const generateMatches = useMutation({
    mutationFn: async () => {
      setIsGenerating(true)
      setError(null)
      return null;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: [tournament.id] })
      } else {
        setError(result.error?.message || 'Fehler beim Erstellen der Matches')
      }
    },
    onError: (error) => {
      setError(error.message || 'Unbekannter Fehler')
    },
    onSettled: () => {
      setIsGenerating(false)
    }
  })

  const canGenerateMatches = () => {
    if (tournament.type === 'bracket') {
      return tournament.teams.length >= 8 && tournament.teams.length % 2 === 0
    }
    return tournament.teams.length >= 2
  }

  const getMatchValidationMessage = () => {
    if (tournament.teams.length < 2) {
      return 'Mindestens 2 Teams erforderlich'
    }
    if (tournament.type === 'bracket') {
      if (tournament.teams.length < 8) {
        return 'Bracket-Turniere benötigen mindestens 8 Teams'
      }
      if (tournament.teams.length % 2 !== 0) {
        return 'Bracket-Turniere benötigen eine gerade Anzahl von Teams'
      }
    }
    return null
  }

  const totalMatches = matches.reduce(
    (total, round) => total + round.matches.length,
    0
  )

  return (
    <PageSection
      title="Match-Verwaltung"
      headerAdditional={
        <div className="flex gap-3">
          {matches.length > 0 && (
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary-foreground/5 rounded-md">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground">
                {totalMatches} Matches, {matches.length} Runden
              </span>
            </div>
          )}
        </div>
      }
    >
      {matches.length === 0 ? (
        <EmptyMatches
          tournament={tournament}
          onGenerate={() => generateMatches.mutate()}
          isGenerating={isGenerating}
          canGenerate={canGenerateMatches()}
          validationMessage={getMatchValidationMessage()}
          error={error}
        />
      ) : (
        <MatchRoundsList rounds={matches} tournament={tournament} />
      )}
    </PageSection>
  )
}

const EmptyMatches = ({
  tournament,
  onGenerate,
  isGenerating,
  canGenerate,
  validationMessage,
  error
}: {
  tournament: Tournament
  onGenerate: () => void
  isGenerating: boolean
  canGenerate: boolean
  validationMessage: string | null
  error: string | null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-secondary-foreground/5 p-4 mb-4">
        <Zap className="h-8 w-8 text-secondary-foreground/60" />
      </div>

      <h3 className="text-lg font-semibold text-secondary-foreground mb-2">
        Keine Matches erstellt
      </h3>

      <p className="text-sm text-secondary-foreground/70 text-center mb-6 max-w-md">
        Erstelle automatisch Matches für dein{' '}
        {tournament.type === 'bracket' ? 'Bracket' : 'Tabellen'}-Turnier.
        {tournament.type === 'bracket'
          ? ' Teams werden in zwei Gruppen aufgeteilt.'
          : ' Jeder spielt gegen jeden.'}
      </p>

      {validationMessage && (
        <Alert className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        {isGenerating ? 'Erstelle Matches...' : 'Matches generieren'}
      </Button>

      {canGenerate && (
        <div className="mt-4 text-xs text-secondary-foreground/60 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {tournament.teams.length} Teams
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {tournament.type === 'bracket' ? 'Bracket' : 'Tabelle'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MatchRoundsList = ({
  rounds,
  tournament
}: {
  rounds: TournamentRound[]
  tournament: Tournament
}) => {
  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <Card key={round.roundNumber}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Runde {round.roundNumber}
              </CardTitle>
              <Badge variant={round.isComplete ? 'default' : 'secondary'}>
                {round.isComplete ? 'Abgeschlossen' : 'Ausstehend'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <BoxGrid>
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  tournament={tournament}
                />
              ))}
            </BoxGrid>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const MatchCard = ({
  match,
  tournament
}: {
  match: TournamentMatch
  tournament: Tournament
}) => {
  const homeTeam = tournament.teams.find((t) => t.id === match.homeTeamId)
  const awayTeam = tournament.teams.find((t) => t.id === match.awayTeamId)

  const getStatusColor = () => {
    switch (match.status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'scheduled':
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-secondary-foreground/60">
            Match {match.matchInRound}
          </div>
          {match.tournamentGroup && (
            <Badge variant="outline" className="text-xs">
              Gruppe {match.tournamentGroup}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm truncate">
                {homeTeam?.name || 'Unbekanntes Team'}
              </div>
            </div>
            <div className="px-2 py-1 bg-secondary-foreground/5 rounded text-sm font-mono min-w-[3rem] text-center">
              {match.homeScore ?? '-'}
            </div>
          </div>

          <div className="text-xs text-center text-secondary-foreground/60">
            vs
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm truncate">
                {awayTeam?.name || 'Unbekanntes Team'}
              </div>
            </div>
            <div className="px-2 py-1 bg-secondary-foreground/5 rounded text-sm font-mono min-w-[3rem] text-center">
              {match.awayScore ?? '-'}
            </div>
          </div>
        </div>

        <div
          className={`mt-3 px-2 py-1 rounded-md text-xs font-medium text-center border ${getStatusColor()}`}
        >
          {match.status === 'completed' && 'Abgeschlossen'}
          {match.status === 'in_progress' && 'Läuft'}
          {match.status === 'scheduled' && 'Geplant'}
        </div>
      </CardContent>
    </Card>
  )
}

export default TournamentMatchManagement
