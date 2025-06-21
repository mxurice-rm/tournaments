import React from 'react'
import { cx } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const BaseCard = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={twMerge(
        cx(
          'flex gap-5 justify-between flex-col p-6 rounded-md border border-white/10 bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm',
          className
        )
      )}
    >
      {children}
    </div>
  )
}

export default BaseCard
