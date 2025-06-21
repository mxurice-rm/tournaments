import {
  date,
  pgEnum,
  pgTable,
  serial,
  text,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const typeEnum = pgEnum('type', ['bracket', 'table'])

export const tournaments = pgTable('tournaments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  type: typeEnum().notNull()
})

export const teams = pgTable('teams', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  captain: varchar('captain', { length: 255 }),
  tournamentId: uuid('tournament_id')
    .notNull()
    .references(() => tournaments.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
})

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade', onUpdate: 'cascade' })
})
