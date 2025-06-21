import React, { ElementType } from 'react'
import { cx } from 'class-variance-authority'

interface MessageProps {
  message?: string,
  icon: ElementType,
  color: string
}

export const Notification = ({ message, icon: Icon, color }: MessageProps) => {
  if (!message) return null

  return (
    <div className={cx('px-3 py-1.5 rounded-xl flex items-center gap-x-2 text-sm', color)}>
      <Icon className="h-4 w-4" />
      <p>{message}</p>
    </div>
  )
}
