import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repository';
import { agents } from './agent';

export const squads = pgTable('squads', {
  id:            uuid().defaultRandom().primaryKey().notNull(),
  repositoryId:  uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId:        uuid('user_id').notNull(),
  name:          text('name').notNull(),
  description:   text('description').notNull().default(''),
  leaderAgentId: uuid('leader_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('squads_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squads_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squads_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squads_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
