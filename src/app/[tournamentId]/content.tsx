'use client'

import { Tournament } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { fetchTournament } from '@/lib/api/queries'
import PageContainer from '@/components/common/page/page-container'
import { Trophy } from 'lucide-react'
import PageSection from '@/components/common/page/page-section'
import { TabsContent } from '@/components/ui/tabs'
import { useState } from 'react'
import UpcomingGroupMatches from '@/components/feature/tournament-match/upcoming-group-matches'
import CompletedGroupMatches from '@/components/feature/tournament-match/completed-group-matches'
import GroupTable from '@/components/feature/tournament-match/group-table'

import { useTournamentData } from './hooks/use-tournament-data'
import { useTournamentMutations } from './hooks/use-tournament-mutations'
import { TournamentStatsDisplay } from './components/tournament-stats-display'
import { CurrentMatchesSection } from './components/current-matches-section'
import { TournamentTabs } from './components/tournament-tabs'
import { PhaseStatusMessages } from './components/phase-status-messages'

interface TournamentPublicViewProps {
  loggedIn: boolean
  initialTournament: Tournament
}

const TournamentPublicView = ({
  initialTournament,
  loggedIn
}: TournamentPublicViewProps) => {
  const [activeTab, setActiveTab] = useState('current')

  const { data: tournament } = useQuery<Tournament>({
    queryKey: [initialTournament.id],
    queryFn: () => fetchTournament(initialTournament.id),
    initialData: initialTournament,
    refetchOnWindowFocus: false
  })

  const tournamentData = useTournamentData(tournament)
  const { endRoundMutation } = useTournamentMutations(tournament)

  const {
    currentRound,
    currentRoundMatches,
    upcomingMatchesByGroup,
    completedMatches,
    completedMatchesByGroup,
    phaseStatus,
    tournamentWinner,
    canEndRound
  } = tournamentData

  const handleEndRound = async () => {
    if (!canEndRound || !currentRound) return

    try {
      await endRoundMutation.mutateAsync({
        currentRoundMatches,
        currentRound,
        rounds: tournamentData.rounds
      })
    } catch (error) {
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

      <TournamentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRoundMatches={currentRoundMatches}
        upcomingRounds={upcomingMatchesByGroup.groupA.concat(upcomingMatchesByGroup.groupB)}
        completedMatches={completedMatches}
        phaseStatus={phaseStatus}
      >

        <TabsContent value="current" className="space-y-6 mt-6">
          {phaseStatus.finalCompleted ? (
            <TournamentStatsDisplay
              tournament={tournament}
              completedMatches={completedMatches}
              tournamentWinner={tournamentWinner}
            />
          ) : (
            <PageSection title="Aktuelle Spiele" headerAdditional={null}>
              {currentRoundMatches.length > 0 ? (
                <CurrentMatchesSection
                  tournament={tournament}
                  currentRoundMatches={currentRoundMatches}
                  currentRound={currentRound}
                  phaseStatus={phaseStatus}
                  canEndRound={canEndRound}
                  isLoggedIn={loggedIn}
                  onEndRound={handleEndRound}
                  isEndingRound={endRoundMutation.isPending}
                />
              ) : (
                <PhaseStatusMessages
                  tournament={tournament}
                  phaseStatus={phaseStatus}
                  isLoggedIn={loggedIn}
                />
              )}
            </PageSection>
          )}
        </TabsContent>
        {!phaseStatus.groupPhaseCompleted && (
          <TabsContent value="upcoming" className="space-y-6 mt-6">
            <PageSection title="Alle kommenden Spiele" headerAdditional={null}>
              {!phaseStatus.groupPhaseCompleted && tournament.matchPlan?.rounds ? (
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
                    {phaseStatus.groupPhaseCompleted
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
      </TournamentTabs>
    </PageContainer>
  )
}

export default TournamentPublicView
