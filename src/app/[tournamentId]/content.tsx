'use client'

import { Tournament, TournamentMatch, TournamentRound } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTournament } from '@/lib/api/queries'
import PageContainer from '@/components/common/page/page-container'
import { Trophy } from 'lucide-react'
import PageSection from '@/components/common/page/page-section'
import { Badge } from '@/components/ui/badge'
import { MatchCard, UpcomingMatchesGroup } from '@/app/[tournamentId]/utils'
import { Button } from '@/components/ui/button'
import { updateTournamentMatch, updateTournamentTeam } from '@/lib/api/mutations'
import {
  calculateTeamStats,
  getNextRoundMatches,
  getUpcomingRoundsByGroup
} from '@/app/[tournamentId]/helper'

const TournamentPublicView = ({
  initialTournament,
  loggedIn
}: {
  loggedIn: boolean
  initialTournament: Tournament
}) => {
  const queryClient = useQueryClient()

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
      .filter((match) => match.status === 'in_progress')
      .sort((a, b) => a.matchInRound - b.matchInRound)

    upcomingRounds = rounds
      .filter((round) => round.roundNumber > currentRound.roundNumber)
      .filter((round) =>
        round.matches.some((match) => match.status === 'scheduled')
      )
  }

  const upcomingMatchesByGroup = getUpcomingRoundsByGroup(upcomingRounds)

  const isGroupPhaseCompleted = (): boolean => {
    if (!tournament.matchPlan?.rounds || tournament.matchPlan.rounds.length === 0) {
      return false
    }

    for (const round of tournament.matchPlan.rounds) {
      for (const match of round.matches) {
        if (match.status !== 'completed') {
          return false
        }

        if (match.homeScore === null || match.awayScore === null) {
          return false
        }
      }
    }

    return true
  }

  const groupPhaseCompleted = isGroupPhaseCompleted()

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
    }
  })

  const canEndRound =
    currentRoundMatches.length > 0 &&
    currentRoundMatches.every(
      (match) => match.homeScore !== null && match.awayScore !== null
    )

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
                  isLoggedIn={loggedIn}
                  tournament={tournament}
                  key={match.id}
                  match={match}
                  isCurrentRound={true}
                />
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
                  ? 'Runde wird beendet...'
                  : canEndRound
                    ? 'Runde beenden'
                    : 'Runde beenden (Ergebnisse fehlen)'}
              </Button>
            )}
          </div>
        ) : groupPhaseCompleted ? (
          <div className="text-center space-y-4 py-8">
            <h3 className="text-2xl font-bold">Gruppenphase beendet!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Alle Spiele der Gruppenphase sind abgeschlossen.
              Die Playoff-Phase kann nun beginnen.
            </p>
            <Badge variant="outline" className="text-sm">
              Alle {tournament.matchPlan?.totalMatches} Spiele gespielt
            </Badge>
          </div>
        ) : (
          <p>asd</p>
        )}
      </PageSection>

      {!groupPhaseCompleted && (
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
      )}
    </PageContainer>
  )
}

export default TournamentPublicView
