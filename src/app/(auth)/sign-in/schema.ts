import { z } from 'zod'

export const schema = z.object({
  username: z.string().min(1, 'Es ist ein Benutzername erforderlich'),
  password: z.string().min(1, 'Es ist ein Password erforderlich')
})
