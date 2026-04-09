import { pgTable, uuid, text, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { timestamps } from './_helpers';

export const teamInvitations = pgTable('team_invitations', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  /** Full name of the invited person */
  fullName: text('full_name').notNull(),
  /** Email address of the invited person */
  email: text('email').notNull(),
  /** The user who sent the invite */
  invitedByUserId: text('invited_by_user_id').notNull(),
  /** Status: pending | accepted | expired */
  status: text('status').notNull().default('pending'),
  ...timestamps,
}, (table) => [
  pgPolicy('service role has full access to team_invitations', {
    as: 'permissive',
    for: 'all',
    to: ['service_role'],
    using: sql`true`,
  }),
  pgPolicy('authenticated users can view team_invitations', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`true`,
  }),
]);
