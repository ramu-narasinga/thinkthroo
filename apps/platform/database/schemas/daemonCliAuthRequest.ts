import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { daemonRuntimes } from './daemonRuntime';

/**
 * Short-lived, single-use handoff row for `thinkthroo setup`'s browser-auth flow.
 * `apiKey` is stored in plaintext here (unlike daemon_runtimes.api_key, which is a hash) because
 * the CLI must redeem it once — rows are consumed (and periodically swept) within minutes.
 */
export const daemonCliAuthRequests = pgTable('daemon_cli_auth_requests', {
  code: text('code').primaryKey().notNull(),
  runtimeId: uuid('runtime_id').notNull().references(() => daemonRuntimes.id, { onDelete: 'cascade' }),
  apiKey: text('api_key').notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, () => [
  pgPolicy('service role has full access to daemon_cli_auth_requests', {
    as: 'permissive', for: 'all', to: ['service_role'],
    using: sql`true`,
  }),
]);
