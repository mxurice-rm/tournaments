import { Trophy } from 'lucide-react'
import React from 'react'

const EmptyObjects = ({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-5 text-center">
      <div className="p-4 rounded-full bg-muted">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default EmptyObjects
