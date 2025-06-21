import { z } from 'zod'

export const TournamentSchema = z.object({
  name: z.string().min(1, 'Es ist ein Name für das Turnier ist erforderlich'),
  date: z.preprocess((val) => {
    if (typeof val === 'string' || val instanceof Date) {
      return new Date(val);
    }
    return val;
  }, z.date().refine((val) => !isNaN(val.getTime()), {
    message: 'Bitte wähle ein gültiges Datum',
  })),
  type: z.enum(['bracket', 'table'], {
    errorMap: () => ({
      message: 'Wähle einer der aufgeführten Turnierformen'
    })
  }),
  description: z
    .string()
    .min(10, 'Es ist eine Beschreibung mit mindestens 10 Zeichen erforderlich')
    .max(500, 'Die Beschreibung darf maximal 500 Zeichen haben'),
  location: z.string().min(1, 'Ein Ort für das Turnier ist erforderlich')
})