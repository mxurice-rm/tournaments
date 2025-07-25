import React from 'react'

const HeaderLine = () => {
  return (
    <div className="relative inline-block">
      <div className="flex items-center justify-center space-x-1">
        <div className="hidden md:block w-8 h-1 bg-primary rounded-full"></div>
        <div className="w-12 h-1 bg-red-500 rounded-full hidden md:block"></div>
        <div className="w-16 h-1 bg-primary rounded-full"></div>
        <div className="w-20 h-2 bg-red-500 rounded-full"></div>
        <div className="w-16 h-1 bg-primary rounded-full"></div>
        <div className="w-12 h-1 bg-red-500 rounded-full hidden md:block"></div>
        <div className="hidden md:block w-8 h-1 bg-primary rounded-full"></div>
      </div>
    </div>
  )
}

export default HeaderLine;