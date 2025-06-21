import React from 'react'

const SectionHeader = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className="flex md:justify-between gap-2 md:gap-0 md:items-center md:flex-row flex-col">
      <div className="flex items-center gap-3">
        <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default SectionHeader;
