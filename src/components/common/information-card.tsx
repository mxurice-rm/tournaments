import React from 'react'

const InfoCard = ({
                    title,
                    info,
                    icon
                  }: {
  title: string
  info: string | Date | React.ReactNode
  icon: React.ReactElement<{ className?: string }>
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-md border border-white/10 bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary/50">
          {React.isValidElement(icon) &&
            React.cloneElement(icon, {
              className: 'h-5 w-5 text-primary'
            })}
        </div>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
      {info instanceof Date ? (
        <p className="font-medium line-clamp-1">
          {new Date(info).toLocaleDateString()}
        </p>
      ) : typeof info === 'string' ? (
        <p className="font-medium line-clamp-1">{info}</p>
      ) : (
        info
      )}
    </div>
  )
}

export default InfoCard