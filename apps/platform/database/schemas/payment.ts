import { pgTable, uuid, text, timestamp, foreignKey, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './user';
import { organizations } from './organization';

export const customers = pgTable('customers', {
  customerId: text('customer_id').primaryKey().notNull(),
  email: text().notNull(),
  // Links this Paddle customer record to a platform user
  userId: uuid('user_id').references(() => profiles.userId, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for authenticated users to customers', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);

export const subscriptions = pgTable('subscriptions', {
  subscriptionId: text('subscription_id').primaryKey().notNull(),
  subscriptionStatus: text('subscription_status').notNull(),
  priceId: text('price_id'),
  productId: text('product_id'),
  scheduledChange: text('scheduled_change'),
  customerId: text('customer_id').notNull(),
  // The org this subscription belongs to
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  // 'monthly' | 'yearly'
  billingInterval: text('billing_interval'),
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
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = ${table.organizationId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);
