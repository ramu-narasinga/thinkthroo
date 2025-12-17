import { pgSchema, uuid } from 'drizzle-orm/pg-core';

// Reference to auth schema tables
export const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});
