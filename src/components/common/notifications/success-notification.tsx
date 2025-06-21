import { CheckIcon } from 'lucide-react'
import { Notification } from '@/components/common/notifications/notification'

interface FormSuccessProps {
  message?: string
}

export const SuccessNotification = ({ message }: FormSuccessProps) => {
  if (!message) return null

  return (
    <Notification
      icon={CheckIcon}
      color="bg-emerald-500/15 text-emerald-500"
      message={message}
    />
  )
}
