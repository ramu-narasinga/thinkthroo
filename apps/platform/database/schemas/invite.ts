import { pgTable, uuid, text, boolean, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { timestamps } from './_helpers';

/**
 * Invited users table — controls who can use the Think Throo GitHub App AI features.
 * Only GitHub usernames/org logins listed here (with is_active = true) are allowed
 * to trigger PR reviews, summaries, and other AI-powered features.
 */
export const invitedUsers = pgTable('invited_users', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  /** GitHub username or organization login that is invited */
  githubLogin: text('github_login').notNull().unique(),
  /** Optional email for reference/contact */
  email: text(),
  /** Optional note about why they were invited */
  note: text(),
  /** Whether the invite is currently active */
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => [
  pgPolicy('service role has full access to invited_users', {
    as: 'permissive',
    for: 'all',
    to: ['service_role'],
    using: sql`true`,
  }),
  pgPolicy('authenticated users can view invited_users', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`true`,
  }),
]);
