import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const typeEnum = pgEnum('type', ['bracket', 'table'])
export const matchPhaseEnum = pgEnum('match_phase', ['group', 'semifinal', 'final'])
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'in_progress', 'completed'])

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

  tournamentGroup: varchar('tournament_group', { length: 10 }),

  points: integer('points').default(0),
  wins: integer('wins').default(0),
  draws: integer('draws').default(0),
  looses: integer('looses').default(0),
  goals: integer('goals').default(0),
  goalsAgainst: integer('goals_against').default(0),
  playedMatches: integer('played_matches').default(0),

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

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey(),
  tournamentId: uuid('tournament_id')
    .notNull()
    .references(() => tournaments.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }),
  homeTeamId: uuid('home_team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  awayTeamId: uuid('away_team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  phase: matchPhaseEnum().notNull().default('group'),
  status: matchStatusEnum().notNull().default('scheduled'),


  matchNumber: integer('match_number').notNull(),
  tournamentGroup: varchar('tournament_group', { length: 10 }),
  roundNumber: integer('round_number').notNull(), // Runden-Nummer (1, 2, 3, ...)
  matchInRound: integer('match_in_round').notNull(), // Position innerhalb der Runde (1, 2, 3, ...)
})
