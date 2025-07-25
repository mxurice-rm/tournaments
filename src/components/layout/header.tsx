import HeaderLine from '@/components/common/header-line'
import React from 'react'

const Header = () => {
  return (
    <header className="flex justify-center py-10 md:py-16 flex-col items-center space-y-2 md:space-y-5 p-5">
      <HeaderLine />
      <div>
        <h1 className="uppercase font-extrabold text-center">
          RW BERRENDORF FUßBALL
        </h1>
        <p className="text-center font-medium max-w-4xl text-muted-foreground">
          Herzlich willkommen und viel Spaß bei den anstehenden Turnieren!
        </p>
      </div>
    </header>
  )
}

export default Header;