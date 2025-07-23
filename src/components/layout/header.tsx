import HeaderLine from '@/components/common/header-line'
import React from 'react'

const Header = () => {
  return (
    <header className="flex justify-center py-10 md:py-16 flex-col items-center space-y-2 md:space-y-4 p-5">
      <HeaderLine />
      <div className="flex gap-5 items-center">
        <h1 className="uppercase font-extrabold text-center">
          RW BERRENDORF FUßBALL
        </h1>
      </div>
      <p className="text-center font-medium max-w-4xl text-muted-foreground">
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
      </p>
    </header>
  )
}

export default Header;