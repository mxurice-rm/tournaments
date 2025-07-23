'use client'

import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { fetchTournament } from '@/lib/api/queries'
import PageContainer from '@/components/common/page/page-container'
import { Clock, Trophy } from 'lucide-react'
import PageSection from '@/components/common/page/page-section'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UpcomingMatchesGroupProps {
  group: string
  upcomingRounds: Array<{
    round: TournamentRound
    matches: TournamentMatch[]
  }>
  tournament: Tournament
}

const getTeamName = (tournament: Tournament, teamId: string) => {
  return tournament.teams.find((team) => team.id === teamId)?.name ?? ''
}

const MatchCard = ({
                     tournament,
                     match,
                     isCurrentRound = false
                   }: {
  tournament: Tournament
  match: TournamentMatch
  isCurrentRound?: boolean
}) => (
  <Card className={`${isCurrentRound ? 'border-primary' : ''}`}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className={`${isCurrentRound ? 'text-lg' : 'text-base'}`}>
          Spiel {match.matchNumber} • Gruppe {match.tournamentGroup}
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="font-semibold text-sm">
              {getTeamName(tournament, match.homeTeamId)}
            </div>
            <div className="text-xs text-muted-foreground">Heim</div>
          </div>
          <div className="px-4">
            <div className="text-center">
              {match.status === 'completed' ||
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

const UpcomingMatchesGroup = ({
                                group,
                                upcomingRounds,
                                tournament
                              }: UpcomingMatchesGroupProps) => {
  const totalMatches = upcomingRounds.reduce(
    (total, { matches }) => total + matches.length,
    0
  )

  // Das erste Spiel der Gruppe als nächstes markieren
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
                {matches.map((match, matchIndex) => {
                  const isNextMatch = nextMatch && match.id === nextMatch.id
                  return (
                    <div key={match.id} className="relative">
                      {isNextMatch && (
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                      )}
                      <MatchCard
                        tournament={tournament}
                        match={{ ...match, roundNumber: round.roundNumber }}
                        isCurrentRound={isNextMatch}
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

const TournamentPublicView = ({
                                initialTournament
                              }: {
  initialTournament: Tournament
}) => {
  const { data: tournament } = useQuery<Tournament>({
    queryKey: [initialTournament.id],
    queryFn: () => fetchTournament(initialTournament.id),
    initialData: initialTournament,
    refetchOnWindowFocus: false
  })

  const rounds =
    tournament.matchPlan?.rounds?.sort(
      (a, b) => a.roundNumber - b.roundNumber
    ) ?? []

  const currentRound = rounds?.find((round) => !round.isComplete)

  let currentRoundMatches: TournamentMatch[] = []
  let upcomingRounds: TournamentRound[] = []

  if (currentRound) {
    currentRoundMatches = currentRound.matches
      .filter((match) => match.status === 'scheduled')
      .sort((a, b) => a.matchInRound - b.matchInRound)

    upcomingRounds = rounds
      .filter((round) => round.roundNumber > currentRound.roundNumber)
      .filter((round) =>
        round.matches.some((match) => match.status === 'scheduled')
      )
  }

  const getMatchesByGroup = (matches: TournamentMatch[], group: string) => {
    return matches.filter((match) => match.tournamentGroup === group)
  }

  const getUpcomingRoundsByGroup = () => {
    if (!upcomingRounds) return { groupA: [], groupB: [] }

    const groupA: Array<{
      round: TournamentRound
      matches: TournamentMatch[]
    }> = []
    const groupB: Array<{
      round: TournamentRound
      matches: TournamentMatch[]
    }> = []

    upcomingRounds.forEach((round) => {
      const groupAMatches = getMatchesByGroup(round.matches, 'A')
      const groupBMatches = getMatchesByGroup(round.matches, 'B')

      if (groupAMatches.length > 0) {
        groupA.push({ round, matches: groupAMatches })
      }

      if (groupBMatches.length > 0) {
        groupB.push({ round, matches: groupBMatches })
      }
    })

    return { groupA, groupB }
  }

  const currentMatchesByGroup = {
    A: getMatchesByGroup(currentRoundMatches, 'A'),
    B: getMatchesByGroup(currentRoundMatches, 'B')
  }

  const upcomingMatchesByGroup = getUpcomingRoundsByGroup()

  const nextMatchByGroup = {
    A: upcomingMatchesByGroup.groupA[0]?.matches[0] || null,
    B: upcomingMatchesByGroup.groupB[0]?.matches[0] || null
  }

  const allMatches = rounds?.flatMap((round) =>
    round.matches.map((match) => ({
      ...match,
      roundNumber: round.roundNumber
    }))
  )

  return (
    <PageContainer
      title={tournament.name}
      description={tournament.description}
      icon={<Trophy />}
    >
      <p className="text-justify mb-7">
        Alle Teams werden in zwei Gruppen aufgeteilt. Jedes Team spielt
        innerhalb der Gruppe gegen jedes andere Team. Die ersten beiden Teams
        aus jeder Gruppe kommen weiter und ziehen in das Halbfinale.
      </p>

      <PageSection title="Aktuelle Spiele" headerAdditional={null}>
        {currentRoundMatches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-5 mb-3">
              <h3 className="text-xl font-semibold">
                Runde {currentRound?.roundNumber}
              </h3>
              <Badge className="text-xs">Spiele laufen parallel</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {currentRoundMatches.map((match) => (
                <MatchCard
                  tournament={tournament}
                  key={match.id}
                  match={match}
                  isCurrentRound={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>ad</p>
        )}
      </PageSection>

      <PageSection title="Alle kommenden Spiele" headerAdditional={null}>
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingMatchesGroup
            group="A"
            upcomingRounds={upcomingMatchesByGroup.groupA}
            tournament={tournament}
          />
          <UpcomingMatchesGroup
            group="B"
            upcomingRounds={upcomingMatchesByGroup.groupB}
            tournament={tournament}
          />
        </div>
      </PageSection>
    </PageContainer>
  )
}

export default TournamentPublicView