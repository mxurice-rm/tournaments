import BaseDialog from '@/components/common/base-dialog'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import React from 'react'

const BaseDeleteDialog = ({
  open,
  setOpen,
  title,
  description,
  triggerButton,
  action
}: {
  open: boolean
  setOpen: React.Dispatch<boolean>
  title: string
  description: string
  triggerButton: React.ReactNode
  action: () => void
}) => {
  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title={title}
      description={description}
      triggerButton={triggerButton}
    >
      <div className="flex gap-3">
        <DialogClose asChild>
          <Button variant="outline" size="sm" className="flex-1">
            Abbrechen
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={action}
          >
            Löschen
          </Button>
        </DialogClose>
      </div>
    </BaseDialog>
  )
}

export default BaseDeleteDialog
