import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/Providers'
import React from 'react'
import ToggleTheme from '@/components/common/toggle-theme'
import { ToastContainer } from 'react-toastify'

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Tournament Management - Created by Maurice R.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${poppins.variable}`}>
        <Providers>
          <div className="fixed top-4 right-4 z-50">
            <ToggleTheme />
          </div>

          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
