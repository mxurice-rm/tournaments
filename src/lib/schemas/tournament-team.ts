import { z } from 'zod'

export const TournamentTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Es muss ein Teamname angegeben werden.')
    .max(50, 'Teamname darf maximal 50 Zeichen lang sein.')
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      'Teamname darf nur Buchstaben, Zahlen und Leerzeichen enthalten.'
    ),

  captain: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z\s]*$/.test(val), {
      message:
        'Der Name des Kapitäns darf nur Buchstaben und Leerzeichen enthalten.'
    }),

  members: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: 'Ein Team darf keine doppelten Mitglieder enthalten.'
    })
    .optional()
})
