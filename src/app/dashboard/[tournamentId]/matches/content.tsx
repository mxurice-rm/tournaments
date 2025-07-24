'use client'

import { Tournament, TournamentMatch } from '@/types'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTournament } from '@/lib/api/queries'
import PageContainer from '@/components/common/page/page-container'
import { Calendar, Plus, Trash, Trophy, Users } from 'lucide-react'
import React from 'react'
import EmptyObjects from '@/components/common/empty-objects'
import { Button } from '@/components/ui/button'
import PageSection from '@/components/common/page/page-section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { errorToast, successToast } from '@/lib/utils'
import { createTournamentMatches, deleteTournamentMatches } from '@/lib/api/mutations'

const EmptyMatches = ({
  tournament,
  canGenerate,
  queryClient,
}: {
  tournament: Tournament
  canGenerate: boolean
  queryClient: QueryClient
}) => {

  const mutation = useMutation({
    mutationFn: async () => {
      return await createTournamentMatches(tournament.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tournament.id] }).then(() => {
        successToast('Es wurden erfolgreich Spiele für das Turnier erstellt')
      })
    },
    onError: () => {
      errorToast()
    }
  })

  return (
    <div>
      <EmptyObjects
        title="Keine Matches erstellt"
        description={`Erstelle Matches für das ausgewählte Turnier. ${
          tournament.type === 'bracket'
            ? ' Teams werden in zwei Gruppen aufgeteilt.'
            : ' Jeder spielt gegen jeden.'
        }`}
      >
        <div>
          <Button
            disabled={!canGenerate || mutation.isPending}
            size="sm"
            className={tournament.teams.length > 0 ? 'flex-1' : ''}
            onClick={() => mutation.mutateAsync()}
          >
            <Plus />
            Matches generieren
          </Button>
          {canGenerate && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tournament.teams.length} Team
                  {tournament.teams.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {tournament.type === 'bracket' ? 'Bracket' : 'Tabelle'}
                </div>
              </div>
            </div>
          )}
        </div>
      </EmptyObjects>
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

  return (
    <Card key={match.id}>
      <CardContent className="!px-0 space-y-3">
        <p className="text-xs text-secondary-foreground/60">
          Match {match.matchInRound}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{homeTeam?.name}</p>
            <div className="px-2 py-1 bg-secondary-foreground/5 rounded text-sm font-mono min-w-[3rem] text-center">
              {match.homeScore ?? '-'}
            </div>
          </div>

          <div className="text-xs text-center text-primary">vs</div>

          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">{awayTeam?.name}</p>
            <div className="px-2 py-1 bg-secondary-foreground/5 rounded text-sm font-mono min-w-[3rem] text-center">
              {match.awayScore ?? '-'}
            </div>
          </div>
        </div>

        <div
          className={`py-1.5 rounded-md text-xs font-medium text-center border bg-secondary-foreground/5`}
        >
          {match.status === 'completed' && 'Abgeschlossen'}
          {match.status === 'in_progress' && 'Läuft'}
          {match.status === 'scheduled' && 'Geplant'}
        </div>
      </CardContent>
    </Card>
  )
}

const TournamentMatchPlanView = ({
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

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await deleteTournamentMatches(tournament.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tournament.id] }).then(() => {
        successToast('Es wurden alle Spiele für das Turnier gelöscht')
      })
    },
    onError: () => {
      errorToast()
    }
  })

  const canGenerateMatches = () => {
    if (tournament.type === 'bracket') {
      return tournament.teams.length >= 8 && tournament.teams.length % 2 === 0
    }
    return tournament.teams.length >= 2
  }

  return (
    <PageContainer
      title="Matchverwaltung"
      description="Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut"
      icon={<Trophy />}
    >
      <PageSection
        title="Matches"
        headerAdditional={
          tournament.matchPlan ? (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => mutation.mutateAsync()}>
                <Trash />
                Spiele zurücksetzen
              </Button>
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary-foreground/5 rounded-md">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">
                  {tournament.matchPlan.totalMatches} Match
                  {tournament.matchPlan.totalMatches !== 1 ? 'es' : ''},{' '}
                  {tournament.matchPlan.totalRounds} Runde
                  {tournament.matchPlan.totalRounds !== 1 ? 'n' : ''}
                </span>
              </div>
            </div>
          ) : null
        }
      >
        {tournament.matchPlan ? (
          <div className="space-y-6">
            {tournament.matchPlan.rounds.map((round) => (
              <Card key={round.roundNumber}>
                <CardHeader className="!gap-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Runde {round.roundNumber}
                    </CardTitle>
                    <Badge variant={round.isComplete ? 'default' : 'default'}>
                      {round.isComplete ? 'Abgeschlossen' : 'Ausstehend'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="!px-0 space-y-4">
                  {round.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      tournament={tournament}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyMatches
            tournament={tournament}
            canGenerate={canGenerateMatches()}
            queryClient={queryClient}
          />
        )}
      </PageSection>
    </PageContainer>
  )
}

export default TournamentMatchPlanView
