import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Clock, Edit3, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { TournamentMatchSchema } from '@/lib/schemas'
import { updateTournamentMatch } from '@/lib/api/mutations'

interface UpcomingMatchesGroupProps {
  group: string
  upcomingRounds: Array<{
    round: TournamentRound
    matches: TournamentMatch[]
  }>
  tournament: Tournament
}

export const getTeamName = (tournament: Tournament, teamId: string) => {
  return tournament.teams.find((team) => team.id === teamId)?.name ?? ''
}

export const MatchCard = ({
  tournament,
  match,
  isCurrentRound = false,
  isLoggedIn = false
}: {
  isLoggedIn?: boolean
  tournament: Tournament
  match: TournamentMatch
  isCurrentRound?: boolean
}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof TournamentMatchSchema>) => {
      return await updateTournamentMatch(match.id, values)
    },
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    }
  })

  const [editing, setEditing] = useState(false)
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? '0')
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? '0')

  const handleCancel = () => {
    setHomeScore(match.homeScore?.toString() ?? '0')
    setAwayScore(match.awayScore?.toString() ?? '0')
    setEditing(false)
  }

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore)
      })
    } catch {
      setEditing(false)
    }
  }

  const canEditMatch =
    isLoggedIn && isCurrentRound && match.status === 'in_progress'

  const hasScores =
    editing ||
    match.status === 'completed' ||
    match.homeScore !== null ||
    match.awayScore !== null

  return (
    <Card className={`${isCurrentRound ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`${isCurrentRound ? 'text-lg' : 'text-base'}`}>
            Spiel {match.matchNumber} • Gruppe {match.tournamentGroup}
          </CardTitle>
          {canEditMatch && !editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Desktop Layout OR Mobile without scores */}
          <div
            className={`${hasScores ? 'hidden sm:flex' : 'flex'} items-center justify-between`}
          >
            <div className="text-center flex-1">
              <div className="font-semibold text-sm">
                {getTeamName(tournament, match.homeTeamId)}
              </div>
              <div className="text-xs text-muted-foreground">Heim</div>
            </div>
            <div className="px-4">
              <div className="text-center">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-16 h-10 text-center text-lg font-bold"
                    />
                    <div className="text-muted-foreground">:</div>
                    <Input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-16 h-10 text-center text-lg font-bold"
                    />
                  </div>
                ) : match.status === 'completed' ||
                  match.homeScore !== null ||
                  match.awayScore !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted px-2 py-1 rounded text-lg font-bold min-w-[2rem]">
                      {match.homeScore ?? 0}
                    </div>
                    <div className="text-muted-foreground">:</div>
                    <div className="bg-muted px-2 py-1 rounded text-lg font-bold min-w-[2rem]">
                      {match.awayScore ?? 0}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold">VS</div>
                )}
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="font-semibold text-sm">
                {getTeamName(tournament, match.awayTeamId)}
              </div>
              <div className="text-xs text-muted-foreground">Auswärts</div>
            </div>
          </div>

          {/* Mobile Layout with scores */}
          {hasScores && (
            <div className="sm:hidden space-y-2">
              {/* Home Team */}
              <div className="text-center">
                <div className="font-semibold text-sm">
                  {getTeamName(tournament, match.homeTeamId)}
                </div>
                <div className="text-xs text-muted-foreground">Heim</div>
              </div>

              {/* Score Section */}
              <div className="text-center">
                {editing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="w-14 h-8 text-center text-sm font-bold"
                    />
                    <div className="text-muted-foreground">:</div>
                    <Input
                      type="number"
                      min="0"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="w-14 h-8 text-center text-sm font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-muted px-2 py-1 rounded text-sm font-bold min-w-[1.5rem]">
                      {match.homeScore ?? 0}
                    </div>
                    <div className="text-muted-foreground">:</div>
                    <div className="bg-muted px-2 py-1 rounded text-sm font-bold min-w-[1.5rem]">
                      {match.awayScore ?? 0}
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="font-semibold text-sm">
                  {getTeamName(tournament, match.awayTeamId)}
                </div>
                <div className="text-xs text-muted-foreground">Auswärts</div>
              </div>
            </div>
          )}

          {editing && (
            <div className="flex items-center justify-center gap-3">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={false}
                className="ml-2"
              >
                <Check />
                Speichern
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={false}
              >
                <X />
                Abbrechen
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {match.status === 'completed'
                ? 'Beendet'
                : isCurrentRound
                  ? 'Laufend'
                  : 'Geplant'}{' '}
              • Runde {match.roundNumber}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const UpcomingMatchesGroup = ({
  group,
  upcomingRounds,
  tournament
}: UpcomingMatchesGroupProps) => {
  const totalMatches = upcomingRounds.reduce(
    (total, { matches }) => total + matches.length,
    0
  )

  const nextMatch = upcomingRounds[0]?.matches[0] || null

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        Gruppe {group}
        <Badge variant="outline">{totalMatches} Spiele</Badge>
      </h3>
      {upcomingRounds.length > 0 ? (
        <div className="space-y-6">
          {upcomingRounds.map(({ round, matches }, roundIndex) => (
            <div key={round.roundNumber} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground border-l-2 border-primary pl-2">
                Runde {round.roundNumber}
                {roundIndex === 0 && (
                  <Badge className="ml-2 text-xs" variant="secondary">
                    Als nächstes
                  </Badge>
                )}
              </h4>
              <div className="space-y-3">
                {matches.map((match) => {
                  const isNextMatch = nextMatch && match.id === nextMatch.id
                  return (
                    <div key={match.id} className="relative">
                      {isNextMatch && (
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                      )}
                      <MatchCard
                        tournament={tournament}
                        match={{ ...match, roundNumber: round.roundNumber }}
                        isCurrentRound={false}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Keine weiteren Spiele für Gruppe {group}
        </p>
      )}
    </div>
  )
}
