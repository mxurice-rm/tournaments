import React from 'react'

const AuthSection = ({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <div className="max-w-md w-full flex flex-col gap-6">
      <div className="flex flex-col justify-center items-center">
        <h3 className="font-black">{title}</h3>
        <p className="text-balance text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default AuthSection
