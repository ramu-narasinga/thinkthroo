import {
  pgTable,
  uuid,
  text,
  integer,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { timestamps } from './_helpers';

/**
 * Stores download stats for each skill package in the Skills Library.
 * Stats are keyed by the skill's Sanity slug.
 */
export const skillStats = pgTable(
  'skill_stats',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    /** Matches the slug field of the `skill` Sanity document */
    skillSlug: text('skill_slug').notNull().unique(),
    /** Rolling 7-day download count */
    weeklyDownloads: integer('weekly_downloads').default(0).notNull(),
    /** Cumulative download count */
    totalDownloads: integer('total_downloads').default(0).notNull(),
    ...timestamps,
  },
  () => [
    pgPolicy('Anyone can read skill stats', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated', 'anon'],
      using: sql`true`,
    }),
    pgPolicy('Service role can manage skill stats', {
      as: 'permissive',
      for: 'all',
      to: ['service_role'],
      using: sql`true`,
    }),
  ]
);
