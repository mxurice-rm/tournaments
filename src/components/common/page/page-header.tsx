import React from 'react'

const PageHeader = ({
  title,
  description,
  icon
}: {
  title: string
  description: string
  icon: React.ReactElement<{ className?: string }>
}) => {
  return (
    <div className="flex items-center gap-5 border-b border-white/10 pb-5 mb-8">
      {React.cloneElement(icon, { className: 'h-8 w-8 text-primary' })}
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-secondary-foreground/70">{description}</p>
      </div>
    </div>
  )
}

export default PageHeader
