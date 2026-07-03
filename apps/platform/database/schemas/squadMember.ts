import { pgTable, uuid, text, timestamp, pgPolicy, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { squads } from './squad';
import { agents } from './agent';

export const squadMembers = pgTable('squad_members', {
  id:         uuid().defaultRandom().primaryKey().notNull(),
  squadId:    uuid('squad_id').references(() => squads.id, { onDelete: 'cascade' }).notNull(),
  userId:     uuid('user_id').notNull(),
  memberType: text('member_type').notNull(), // 'agent' | 'member'
  agentId:    uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  memberId:   uuid('member_id'), // profile UUID for human members
  role:       text('role'),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('squad_members_squad_agent_unique').on(table.squadId, table.memberType, table.agentId),
  pgPolicy('squad_members_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squad_members_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squad_members_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('squad_members_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
