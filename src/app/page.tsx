'use client'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { useQuery } from '@tanstack/react-query'
import { Tournament } from '@/types'
import { fetchTournaments } from '@/lib/api/queries'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect } from 'react'
import {
  ArrowRight,
  Calendar,
  FileText,
  MapPin,
  Tag,
  Trophy,
  Users
} from 'lucide-react'
import { tournamentTypeMapping } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TournamentDetail } from '@/components/feature/tournament/tournament-card'

const Page = () => {
  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: fetchTournaments,
    refetchOnWindowFocus: false
  })

  const futureTournaments = (tournaments || []).filter((tournament) => {
    if (!tournament.date) return false

    const tournamentDay = new Date(tournament.date).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)

    return tournamentDay >= today
  })

  const tournament = futureTournaments[0]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>

      {/* PAGE CONTAINER */}
      <div className="max-w-7xl container mx-auto flex-grow flex flex-col">
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <main className="my-5 space-y-4 p-5">
          {tournament && (
            <Card className="min-w-">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/20">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {tournament.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 px-2 py-1 bg-secondary-foreground/5 rounded-md">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-secondary-foreground">
                  {tournament.teams?.length || 0} Teams
                </span>
                </div>
              </div>

              <p className="text-sm">{tournament.description}</p>

              <div className="space-y-2">
                <TournamentDetail
                  icon={<Calendar />}
                  detail={tournament.date.toLocaleDateString('de-DE')}
                />
                <TournamentDetail
                  icon={<MapPin />}
                  detail={tournament.location}
                />
              </div>

              <Link href={`/${tournament.id}`}>
                <Button variant="outline" className="w-full">
                  Zum Turnier
                  <ArrowRight />
                </Button>
              </Link>
            </Card>
          )}
        </main>
      </div>
      {/* FOOTER */}
      <Footer />
    </div>
  )
}

export default Page
