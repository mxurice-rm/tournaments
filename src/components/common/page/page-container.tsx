import PageHeader from '@/components/common/page/page-header'
import React from 'react'

const PageContainer = ({
  title,
  description,
  icon,
  children
}: {
  title: string
  description: string
  icon: React.ReactElement<{ className?: string }>
  children: React.ReactNode
}) => {
  return (
    <div className="container mx-auto p-5">
      <PageHeader title={title} description={description} icon={icon} />

      <div className="space-y-12">{children}</div>
    </div>
  )
}

export default PageContainer;
