import { pgTable, uuid, text, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users as authUsers } from './auth';

export const profiles = pgTable('profiles', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id')
    .references(() => authUsers.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  email: text(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  userName: text('user_name'),
}, (table) => [
  unique('profiles_email_key').on(table.email),
  pgPolicy('users can view their own profile', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own profile', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own profile', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
]);
