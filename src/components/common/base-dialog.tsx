import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import React from 'react'

const BaseDialog = ({
  title,
  description,
  open,
  setOpen,
  triggerButton,
  children
}: {
  open: boolean
  setOpen: React.Dispatch<boolean>
  title: string
  description: string
  triggerButton: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(false)}>
        {triggerButton}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default BaseDialog
