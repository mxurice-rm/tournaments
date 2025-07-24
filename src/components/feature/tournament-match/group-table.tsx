import { Tournament } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { sortTeamsByRanking } from '@/lib/services/match-generators/finals'

interface GroupTableProps {
  group: string
  teams: Tournament['teams']
}

interface TeamStatsCardProps {
  team: Tournament['teams'][0]
  position: number
  isQualified: boolean
}

const getPositionBadge = (position: number) => {
  const baseClasses = 'w-5 h-5 sm:w-6 sm:h-6 rounded-full p-0 flex items-center justify-center text-xs'
  const variant = position <= 2 ? 'default' : 'secondary'
  const fontWeight = position <= 2 ? 'font-bold' : ''
  
  return (
    <Badge variant={variant} className={`${baseClasses} ${fontWeight}`}>
      {position}
    </Badge>
  )
}

const TeamStatsCard = ({ team, position, isQualified }: TeamStatsCardProps) => {
  const goalDiff = (team.goals ?? 0) - (team.goalsAgainst ?? 0)
  const gamesPlayed = (team.wins ?? 0) + (team.draws ?? 0) + (team.looses ?? 0)
  
  const cardClasses = `rounded-lg border p-4 space-y-3 ${
    isQualified
      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
      : ''
  }`
  
  const getDiffColor = (diff: number) => {
    if (diff > 0) return 'text-green-600'
    if (diff < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }
  
  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getPositionBadge(position)}
          <div>
            <div className="font-semibold text-sm">{team.name}</div>
            {isQualified && (
              <Badge variant="secondary" className="text-xs mt-1">
                Qualifiziert
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{team.points ?? 0}</div>
          <div className="text-xs text-muted-foreground">Punkte</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Spiele:</span>
            <span className="font-medium">{gamesPlayed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tore:</span>
            <span className="font-medium">
              {team.goals ?? 0}:{team.goalsAgainst ?? 0}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diff:</span>
            <span className={`font-medium ${getDiffColor(goalDiff)}`}>
              {goalDiff > 0 ? '+' : ''}{goalDiff}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">S/U/N:</span>
            <div className="flex gap-1 text-xs">
              <span className="text-green-600 font-medium">{team.wins ?? 0}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-yellow-600 font-medium">{team.draws ?? 0}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-red-600 font-medium">{team.looses ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const GroupTable = ({ group, teams }: GroupTableProps) => {
  const groupTeams = sortTeamsByRanking(
    teams.filter((team) => team.tournamentGroup === group)
  )


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg sm:text-xl font-semibold">Gruppe {group}</h3>
        <Badge variant="outline" className="text-xs">
          {groupTeams.length} Teams
        </Badge>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <UITable>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center w-16">Sp</TableHead>
              <TableHead className="text-center w-16">S</TableHead>
              <TableHead className="text-center w-16">U</TableHead>
              <TableHead className="text-center w-16">N</TableHead>
              <TableHead className="text-center w-20">Tore</TableHead>
              <TableHead className="text-center w-16">Diff</TableHead>
              <TableHead className="text-center w-16 font-bold">Pkt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupTeams.map((team, index) => {
              const position = index + 1
              const goalDiff = (team.goals ?? 0) - (team.goalsAgainst ?? 0)
              const isQualified = position <= 2

              return (
                <TableRow
                  key={team.id}
                  className={`${isQualified ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                >
                  <TableCell className="text-center">
                    {getPositionBadge(position)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {team.name}
                      {isQualified && (
                        <Badge variant="secondary" className="text-xs">
                          Qualifiziert
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {(team.wins ?? 0) + (team.draws ?? 0) + (team.looses ?? 0)}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-medium">
                    {team.wins ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-yellow-600 font-medium">
                    {team.draws ?? 0}
                  </TableCell>
                  <TableCell className="text-center text-red-600 font-medium">
                    {team.looses ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs">
                      {team.goals ?? 0}:{team.goalsAgainst ?? 0}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium ${
                      goalDiff > 0
                        ? 'text-green-600'
                        : goalDiff < 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {goalDiff > 0 ? '+' : ''}
                    {goalDiff}
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">
                    {team.points ?? 0}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </UITable>
      </div>

      <div className="md:hidden space-y-3">
        {groupTeams.map((team, index) => {
          const position = index + 1
          const isQualified = position <= 2
          
          return (
            <TeamStatsCard
              key={team.id}
              team={team}
              position={position}
              isQualified={isQualified}
            />
          )
        })}
      </div>

      {groupTeams.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Die ersten 2 Teams qualifizieren sich für das Halbfinale</p>
          <p>
            <strong>Sortierung:</strong> Punkte → Tordifferenz → Geschossene
            Tore
          </p>
        </div>
      )}
    </div>
  )
}

export default GroupTable
