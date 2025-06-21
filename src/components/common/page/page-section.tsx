import SectionHeader from '@/components/common/page/section-header'
import React from 'react'

const PageSection = ({
  title,
  headerAdditional,
  children
}: {
  title: string
  headerAdditional: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div className="space-y-4">
      <SectionHeader title={title}>{headerAdditional}</SectionHeader>
      {children}
    </div>
  )
}

export default PageSection
