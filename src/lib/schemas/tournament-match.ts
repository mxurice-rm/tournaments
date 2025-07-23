import { z } from 'zod'

export const TournamentMatchSchema = z.object({
  homeScore: z.number().int().optional(),
  awayScore: z.number().int().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed']).optional(),
})