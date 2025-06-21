import React from 'react'
import { Trophy } from 'lucide-react'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-primary lg:block p-6 md:p-10">
        <div className="flex flex-col justify-between h-full">
          <a
            href="#"
            className="flex items-center gap-3 text-muted font-bold uppercase"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-primary">
              <Trophy className="size-6" />
            </div>
            WIR SPIELEN FUßBALL
          </a>
          <p className="text-primary-foreground">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet.
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center p-10 bg-background">
        {children}
      </div>
    </div>
  )
}
