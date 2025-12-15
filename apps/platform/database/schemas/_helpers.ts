import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
};

export const createdAt = () =>
  timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow();

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow();
