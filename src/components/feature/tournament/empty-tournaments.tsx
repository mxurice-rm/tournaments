import EmptyObjects from '@/components/common/empty-objects'
import React from 'react'

const EmptyTournaments = ({ children }: { children: React.ReactNode }) => {
  return (
    <EmptyObjects
      title="Es wurden keine Turniere gefunden"
      description="Es wurden noch keine Turniere erstellt. Erstelle das erste Turnier um
          loszulegen."
    >
      {children}
    </EmptyObjects>
  )
}

export default EmptyTournaments
