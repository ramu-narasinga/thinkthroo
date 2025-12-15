import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from './schemas';

export type ThinkThrooDatabaseSchema = typeof schema;

export type ThinkThrooDatabase = PostgresJsDatabase<ThinkThrooDatabaseSchema>;

export type Transaction = Parameters<Parameters<ThinkThrooDatabase['transaction']>[0]>[0];