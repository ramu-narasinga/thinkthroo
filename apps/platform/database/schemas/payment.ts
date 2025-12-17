import { pgTable, text, timestamp, foreignKey, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const customers = pgTable('customers', {
  customerId: text('customer_id').primaryKey().notNull(),
  email: text().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, () => [
  pgPolicy('Enable read access for authenticated users to customers', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`true`,
  }),
]);

export const subscriptions = pgTable('subscriptions', {
  subscriptionId: text('subscription_id').primaryKey().notNull(),
  subscriptionStatus: text('subscription_status').notNull(),
  priceId: text('price_id'),
  productId: text('product_id'),
  scheduledChange: text('scheduled_change'),
  customerId: text('customer_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  planDuration: text('plan_duration'),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
}, (table) => [
  foreignKey({
    columns: [table.customerId],
    foreignColumns: [customers.customerId],
    name: 'public_subscriptions_customer_id_fkey',
  }),
  pgPolicy('Enable read access for authenticated users to subscriptions', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`true`,
  }),
]);
