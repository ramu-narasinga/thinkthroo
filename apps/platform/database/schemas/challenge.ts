import {
  pgTable,
  uuid,
  text,
  timestamp,
  foreignKey,
  unique,
  pgPolicy,
  jsonb,
  integer,
  interval,
  index,
  check,
  primaryKey,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users as authUsers } from './auth';
import { profiles } from './user';

export const challengeParticipants = pgTable('challenge_participants', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  challengeSlug: text('challenge_slug').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [authUsers.id],
    name: 'challenge_participants_user_id_fkey',
  }).onDelete('cascade'),
  unique('unique_user_challenge').on(table.userId, table.challengeSlug),
  pgPolicy('Allow delete for own participation', {
    as: 'permissive',
    for: 'delete',
    to: ['public'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('Allow insert for own participation', {
    as: 'permissive',
    for: 'insert',
    to: ['public'],
  }),
  pgPolicy('Allow select for own participation', {
    as: 'permissive',
    for: 'select',
    to: ['public'],
  }),
  pgPolicy('Allow update for own participation', {
    as: 'permissive',
    for: 'update',
    to: ['public'],
  }),
]);

export const challengeSubmissions = pgTable('challenge_submissions', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  challengeSlug: text('challenge_slug').notNull(),
  userId: uuid('user_id').notNull(),
  githubUrl: text('github_url').notNull(),
  description: text().notNull(),
  ossReferences: jsonb('oss_references').default([]),
  screenshotUrls: text('screenshot_urls').array().default(['']),
  submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  timeTaken: interval('time_taken'),
  upvotes: integer().default(0),
  downvotes: integer().default(0),
}, (table) => [
  index('idx_submissions_challenge_slug').using('btree', table.challengeSlug.asc().nullsLast().op('text_ops')),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.id],
    name: 'fk_user_id',
  }),
  pgPolicy('Delete own submission', {
    as: 'permissive',
    for: 'delete',
    to: ['public'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('Insert own submission', {
    as: 'permissive',
    for: 'insert',
    to: ['public'],
  }),
  pgPolicy('Public can view submissions', {
    as: 'permissive',
    for: 'select',
    to: ['public'],
  }),
  pgPolicy('Update own submission', {
    as: 'permissive',
    for: 'update',
    to: ['public'],
  }),
]);

export const submissionVotes = pgTable('submission_votes', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  submissionId: uuid('submission_id').notNull(),
  userId: uuid('user_id').notNull(),
  voteType: text('vote_type'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.submissionId],
    foreignColumns: [challengeSubmissions.id],
    name: 'submission_votes_submission_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [authUsers.id],
    name: 'submission_votes_user_id_fkey',
  }).onDelete('cascade'),
  unique('unique_vote_per_user_submission').on(table.submissionId, table.userId),
  pgPolicy('Delete own vote', {
    as: 'permissive',
    for: 'delete',
    to: ['public'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('Insert own vote', {
    as: 'permissive',
    for: 'insert',
    to: ['public'],
  }),
  pgPolicy('Public can view votes', {
    as: 'permissive',
    for: 'select',
    to: ['public'],
  }),
  pgPolicy('Update own vote', {
    as: 'permissive',
    for: 'update',
    to: ['public'],
  }),
  check('submission_votes_vote_type_check', sql`vote_type = ANY (ARRAY['upvote'::text, 'downvote'::text])`),
]);

export const submissionLeaderboard = pgTable('submission_leaderboard', {
  challengeSlug: text('challenge_slug').notNull(),
  submissionId: uuid('submission_id').notNull(),
  userId: uuid('user_id').notNull(),
  rank: integer(),
  score: doublePrecision(),
  computedAt: timestamp('computed_at', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  index('idx_leaderboard_challenge_slug').using('btree', table.challengeSlug.asc().nullsLast().op('text_ops')),
  foreignKey({
    columns: [table.submissionId],
    foreignColumns: [challengeSubmissions.id],
    name: 'submission_leaderboard_submission_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [authUsers.id],
    name: 'submission_leaderboard_user_id_fkey',
  }).onDelete('cascade'),
  primaryKey({ columns: [table.challengeSlug, table.submissionId], name: 'submission_leaderboard_pkey' }),
  pgPolicy('Public can read leaderboard', {
    as: 'permissive',
    for: 'select',
    to: ['public'],
    using: sql`true`,
  }),
]);
