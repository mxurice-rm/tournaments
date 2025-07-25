import React from 'react'
import { Card } from '@/components/ui/card'

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
    <Card className="!p-4 !gap-3">
      <div className="flex items-center">
        <div className="pl-0 p-2 rounded-md ">
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
    </Card>
  )
}

export default InfoCard
