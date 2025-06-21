import { ShieldAlert } from 'lucide-react'
import { Notification } from '@/components/common/notifications/notification'

interface FormErrorProps {
  message?: string
}

export const ErrorNotification = ({ message }: FormErrorProps) => {
  if (!message) return null

  return <Notification icon={ShieldAlert} color="bg-red-500/15 text-destructive" message={message} />
}
