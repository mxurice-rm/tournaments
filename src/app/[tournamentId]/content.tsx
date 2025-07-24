'use client'

import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTournament } from '@/lib/api/queries'
import PageContainer from '@/components/common/page/page-container'
import { Calendar, History, Plus, Table, Trophy } from 'lucide-react'
import PageSection from '@/components/common/page/page-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  updateTournamentMatch,
  updateTournamentTeam
} from '@/lib/api/mutations'
import {
  calculateTeamStats,
  getNextRoundMatches,
  getUpcomingRoundsByGroup
} from '@/app/[tournamentId]/helper'
import EditableMatchCard from '@/components/feature/tournament-match/editable-match-card'
import UpcomingGroupMatches from '@/components/feature/tournament-match/upcoming-group-matches'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import CompletedGroupMatches from '@/components/feature/tournament-match/completed-group-matches'
import { errorToast } from '@/lib/utils'
import GroupTable from '@/components/feature/tournament-match/group-table'

const TournamentPublicView = ({
  initialTournament,
  loggedIn
}: {
  loggedIn: boolean
  initialTournament: Tournament
}) => {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('current')

  const { data: tournament } = useQuery<Tournament>({
    queryKey: [initialTournament.id],
    queryFn: () => fetchTournament(initialTournament.id),
    initialData: initialTournament,
    refetchOnWindowFocus: false
  })

  const router = useRouter()

  // ------------------ COLLECT CURRENT ROUND STUFF ------------------ //

  const rounds =
    tournament.matchPlan?.rounds?.sort(
      (a, b) => a.roundNumber - b.roundNumber
    ) ?? []

  const currentRound = rounds?.find((round) => !round.isComplete)

  let currentRoundMatches: TournamentMatch[] = []
  let upcomingRounds: TournamentRound[] = []

  if (currentRound) {
    currentRoundMatches = currentRound.matches
      .filter((match) => match.status === 'in_progress')
      .sort((a, b) => a.matchInRound - b.matchInRound)

    upcomingRounds = rounds
      .filter((round) => round.roundNumber > currentRound.roundNumber)
      .filter((round) =>
        round.matches.some((match) => match.status === 'scheduled')
      )
  }

  const upcomingMatchesByGroup = getUpcomingRoundsByGroup(upcomingRounds)

  // ------------------ COLLECT COMPLETED MATCHES ------------------ //

  const getAllCompletedMatches = (): TournamentMatch[] => {
    return rounds.flatMap((round) =>
      round.matches
        .filter((match) => match.status === 'completed')
        .map((match) => ({ ...match, roundNumber: round.roundNumber }))
    )
  }

  const completedMatches = getAllCompletedMatches()

  const getMatchGroup = (match: TournamentMatch): string | null => {
    if (match.tournamentGroup) {
      return match.tournamentGroup
    }

    // Für Playoff-Spiele: Schaue welche Gruppen die Teams ursprünglich hatten
    const homeTeam = tournament.teams.find(
      (team) => team.id === match.homeTeamId
    )
    const awayTeam = tournament.teams.find(
      (team) => team.id === match.awayTeamId
    )

    if (
      homeTeam?.tournamentGroup &&
      awayTeam?.tournamentGroup &&
      homeTeam.tournamentGroup === awayTeam.tournamentGroup
    ) {
      return homeTeam.tournamentGroup
    }

    return null // Gruppenübergreifendes Spiel
  }

  const completedMatchesByGroup = {
    A: completedMatches.filter(
      (match) => getMatchGroup(match) === 'A' || match.phase === 'final'
    ),
    B: completedMatches.filter(
      (match) => getMatchGroup(match) === 'B' || match.phase === 'final'
    )
  }

  // ------------------ STATES ------------------ //

  const isPhaseCompleted = (phase: string): boolean => {
    if (
      !tournament.matchPlan?.rounds ||
      tournament.matchPlan.rounds.length === 0
    ) {
      return false
    }

    let hasPhaseMatches = false

    for (const round of tournament.matchPlan.rounds) {
      if (!round.matches || round.matches.length === 0) {
        continue
      }

      for (const match of round.matches) {
        if (match.phase === phase) {
          hasPhaseMatches = true

          if (match.status !== 'completed') {
            return false
          }

          if (match.homeScore === null || match.awayScore === null) {
            return false
          }
        }
      }
    }

    return hasPhaseMatches
  }

  const groupPhaseCompleted = isPhaseCompleted('group')
  const semifinalCompleted =
    groupPhaseCompleted && isPhaseCompleted('semifinal')
  const finalCompleted =
    groupPhaseCompleted && semifinalCompleted && isPhaseCompleted('final')

  const canEndRound =
    currentRoundMatches.length > 0 &&
    currentRoundMatches.every(
      (match) => match.homeScore !== null && match.awayScore !== null
    )

  const getTournamentWinner = (): {
    teamName: string
    teamId: string
  } | null => {
    if (!finalCompleted) return null

    const finalMatch = completedMatches.find((match) => match.phase === 'final')
    if (
      !finalMatch ||
      finalMatch.homeScore === null ||
      finalMatch.awayScore === null
    ) {
      return null
    }

    const winnerId =
      finalMatch.homeScore > finalMatch.awayScore
        ? finalMatch.homeTeamId
        : finalMatch.awayTeamId

    const winnerTeam = tournament.teams.find((team) => team.id === winnerId)

    return winnerTeam ? { teamName: winnerTeam.name, teamId: winnerId } : null
  }

  const tournamentWinner = getTournamentWinner()

  // ------------------ UPDATES ------------------ //

  const createTeamUpdates = (matches: TournamentMatch[]): Promise<void>[] => {
    const teamUpdates: Promise<void>[] = []

    matches.forEach((match) => {
      const homeStats = calculateTeamStats(tournament, match, match.homeTeamId)
      teamUpdates.push(updateTournamentTeam(match.homeTeamId, homeStats))

      const awayStats = calculateTeamStats(tournament, match, match.awayTeamId)
      teamUpdates.push(updateTournamentTeam(match.awayTeamId, awayStats))
    })

    return teamUpdates
  }

  const endRoundMutation = useMutation({
    mutationFn: async () => {
      const updatePromises: Promise<void>[] = []

      const completeCurrentMatches = currentRoundMatches.map((match) =>
        updateTournamentMatch(match.id, {
          status: 'completed'
        })
      )
      updatePromises.push(...completeCurrentMatches)

      const teamStatsUpdates = createTeamUpdates(currentRoundMatches)
      updatePromises.push(...teamStatsUpdates)

      const nextRoundMatches = getNextRoundMatches(currentRound!, rounds)
      if (nextRoundMatches.length > 0) {
        const startNextMatches = nextRoundMatches.map((match) =>
          updateTournamentMatch(match.id, {
            status: 'in_progress'
          })
        )
        updatePromises.push(...startNextMatches)
      }

      return Promise.all(updatePromises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tournament.id] })
    },
    onError: (error) => {
      console.error('Error ending round:', error)
      errorToast()
    }
  })

  const handleEndRound = async () => {
    if (!canEndRound || !currentRound) return

    try {
      await endRoundMutation.mutateAsync()
    } catch (error) {
      // Error is handled in mutation.onError
      console.error('End round error:', error)
    }
  }

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid w-full h-auto ${groupPhaseCompleted ? 'grid-cols-3' : 'grid-cols-4'}`}
        >
          <TabsTrigger
            value="current"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
          >
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Aktuelle Spiele</span>
            <span className="sm:hidden">Aktuell</span>
            {currentRoundMatches.length > 0 && (
              <Badge variant="secondary" className="h-4 text-xs min-w-0 px-1">
                {currentRoundMatches.length}
              </Badge>
            )}
          </TabsTrigger>

          {!groupPhaseCompleted && (
            <TabsTrigger
              value="upcoming"
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Kommende Spiele</span>
              <span className="sm:hidden">Kommend</span>
              {upcomingRounds.length > 0 && (
                <Badge variant="secondary" className="h-4 text-xs min-w-0 px-1">
                  {upcomingRounds.reduce(
                    (total, round) => total + round.matches.length,
                    0
                  )}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger
            value="completed"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
          >
            <History className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Gespielte Spiele</span>
            <span className="sm:hidden">Gespielt</span>
            {completedMatches.length > 0 && (
              <Badge variant="secondary" className="h-4 text-xs min-w-0 px-1">
                {completedMatches.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="table"
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
          >
            <Table className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Tabelle</span>
            <span className="sm:hidden">Tabelle</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6 mt-6">
          {finalCompleted ? (
            // Turnier beendet - keine PageSection, direktes Layout
            <div className="text-center space-y-6 py-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">🏆 Turnier beendet!</h3>

                {tournamentWinner ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-4xl font-bold text-foreground mb-4">
                        {tournamentWinner.teamName}
                      </h4>
                      <Badge variant="outline" className="text-base px-4 py-2">
                        🥇 Turniersieger
                      </Badge>
                    </div>

                    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      Herzlichen Glückwunsch an{' '}
                      <strong className="text-foreground">
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

                {/* Turnier-Statistiken */}
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
                      {completedMatches.reduce(
                        (sum, match) =>
                          sum + (match.homeScore || 0) + (match.awayScore || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Tore</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-card">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.max(
                        ...(tournament.matchPlan?.rounds?.map(
                          (r) => r.roundNumber
                        ) || [0])
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Runden</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Normale PageSection für laufende/geplante Spiele
            <PageSection title="Aktuelle Spiele" headerAdditional={null}>
              {currentRoundMatches.length > 0 ? (
                <div className="space-y-4 w-full">
                  {/* Bestehender Code für aktive Spiele */}
                  <div className="flex items-center gap-5 mb-3">
                    {(() => {
                      if (groupPhaseCompleted && !semifinalCompleted) {
                        return (
                          <>
                            <h3 className="text-xl font-semibold">
                              Halbfinale
                            </h3>
                            <Badge className="text-xs">
                              Spiele laufen parallel
                            </Badge>
                          </>
                        )
                      } else if (!groupPhaseCompleted) {
                        return (
                          <>
                            <h3 className="text-xl font-semibold">
                              Runde {currentRound?.roundNumber}
                            </h3>
                            <Badge className="text-xs">
                              Spiele laufen parallel
                            </Badge>
                          </>
                        )
                      }
                    })()}
                  </div>

                  <div
                    className={`gap-4 ${
                      currentRoundMatches.some(
                        (match) => match.phase === 'final'
                      )
                        ? 'flex justify-center'
                        : 'grid grid-cols-1 md:grid-cols-2'
                    }`}
                  >
                    {currentRoundMatches.map((match) => (
                      <div
                        key={match.id}
                        className={
                          match.phase === 'final' ? 'w-full max-w-3xl' : ''
                        }
                      >
                        <EditableMatchCard
                          isLoggedIn={loggedIn}
                          tournament={tournament}
                          match={match}
                          isCurrentRound={true}
                          headerTitle={
                            match.phase === 'final' ? '🏆 FINALE' : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {loggedIn && (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={handleEndRound}
                      disabled={!canEndRound || endRoundMutation.isPending}
                      variant={canEndRound ? 'default' : 'secondary'}
                    >
                      {endRoundMutation.isPending
                        ? currentRoundMatches.some(
                            (match) => match.phase === 'final'
                          )
                          ? 'Turnier wird beendet...'
                          : 'Runde wird beendet...'
                        : canEndRound
                          ? currentRoundMatches.some(
                              (match) => match.phase === 'final'
                            )
                            ? 'Turnier beenden'
                            : 'Runde beenden'
                          : 'Runde beenden (Ergebnisse fehlen)'}
                    </Button>
                  )}
                </div>
              ) : tournament.matchPlan === null ? (
                <div className="text-center space-y-2 py-5">
                  <h3 className="text-2xl font-bold">Keine Spiele gefunden!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Für dieses Turnier wurde noch kein Spielplan erstellt.
                  </p>
                  {loggedIn && (
                    <Button
                      size="sm"
                      className="px-5"
                      onClick={() =>
                        router.push(`dashboard/${tournament.id}/matches`)
                      }
                    >
                      <Plus />
                      Spiele erstellen
                    </Button>
                  )}
                </div>
              ) : semifinalCompleted ? (
                <div className="text-center space-y-2 py-5">
                  <h3 className="text-2xl font-bold">Halbfinale beendet!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Das Halbfinale ist abgeschlossen. Das Finale kann nun
                    beginnen.
                  </p>
                </div>
              ) : groupPhaseCompleted ? (
                <div className="text-center space-y-2 py-5">
                  <h3 className="text-2xl font-bold">Gruppenphase beendet!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Alle Spiele der Gruppenphase sind abgeschlossen. Die
                    Playoff-Phase kann nun beginnen.
                  </p>
                  <Badge variant="outline" className="text-sm">
                    Bereit für das Halbfinale
                  </Badge>
                </div>
              ) : (
                <div className="text-center space-y-2 py-5">
                  <h3 className="text-2xl font-bold">Keine aktiven Spiele</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Momentan laufen keine Spiele.
                  </p>
                </div>
              )}
            </PageSection>
          )}
        </TabsContent>
        {!groupPhaseCompleted && (
          <TabsContent value="upcoming" className="space-y-6 mt-6">
            <PageSection title="Alle kommenden Spiele" headerAdditional={null}>
              {!groupPhaseCompleted && tournament.matchPlan?.rounds ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <UpcomingGroupMatches
                    group="A"
                    upcomingRounds={upcomingMatchesByGroup.groupA}
                    tournament={tournament}
                  />
                  <UpcomingGroupMatches
                    group="B"
                    upcomingRounds={upcomingMatchesByGroup.groupB}
                    tournament={tournament}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {groupPhaseCompleted
                      ? 'Alle Spiele der Gruppenhase wurden bereits gespielt'
                      : 'Keine kommenden Spiele verfügbar'}
                  </p>
                </div>
              )}
            </PageSection>
          </TabsContent>
        )}
        <TabsContent value="completed" className="space-y-6 mt-6">
          <PageSection title="Gespielte Spiele" headerAdditional={null}>
            {completedMatches.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <CompletedGroupMatches
                  group="A"
                  matches={completedMatchesByGroup.A}
                  tournament={tournament}
                  loggedIn={loggedIn}
                />
                <CompletedGroupMatches
                  group="B"
                  matches={completedMatchesByGroup.B}
                  tournament={tournament}
                  loggedIn={loggedIn}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Noch keine Spiele gespielt
                </p>
              </div>
            )}
          </PageSection>
        </TabsContent>
        <TabsContent value="table" className="space-y-6 mt-6">
          <PageSection title="Gruppenphase Tabelle" headerAdditional={null}>
            <div className="grid gap-6 lg:grid-cols-2">
              <GroupTable group="A" teams={tournament.teams} />
              <GroupTable group="B" teams={tournament.teams} />
            </div>
          </PageSection>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

export default TournamentPublicView
