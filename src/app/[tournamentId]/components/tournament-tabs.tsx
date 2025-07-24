import { TournamentMatch, TournamentRound } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, History, Table, Trophy } from 'lucide-react'
import { TournamentPhaseStatus } from '../helper'

interface TournamentTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  currentRoundMatches: TournamentMatch[]
  upcomingRounds: Array<{ round: TournamentRound; matches: TournamentMatch[] }>
  completedMatches: TournamentMatch[]
  phaseStatus: TournamentPhaseStatus
  children: React.ReactNode
}

export const TournamentTabs = ({
  activeTab,
  onTabChange,
  currentRoundMatches,
  upcomingRounds,
  completedMatches,
  phaseStatus,
  children
}: TournamentTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList
        className={`grid w-full h-auto ${
          phaseStatus.groupPhaseCompleted ? 'grid-cols-3' : 'grid-cols-4'
        }`}
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

        {!phaseStatus.groupPhaseCompleted && (
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

      {children}
    </Tabs>
  )
}