import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organization';

export const licensePurchases = pgTable('license_purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  dodoPaymentId: text('dodo_payment_id').notNull().unique(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
  licenseStartsAt: timestamp('license_starts_at', { withTimezone: true }).notNull(),
  licenseExpiresAt: timestamp('license_expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
