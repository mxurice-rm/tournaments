import EmptyObjects from '@/components/common/empty-objects'
import React from 'react'

const EmptyTournamentsTeams = ({ children }: { children: React.ReactNode }) => {
  return (
    <EmptyObjects
      title="Es wurden keine Teams gefunden"
      description="Es wurden noch keine Teams für dieses Turnier erstellt. Erstelle das erste Team.">
      {children}
    </EmptyObjects>
  )
}

export default EmptyTournamentsTeams
