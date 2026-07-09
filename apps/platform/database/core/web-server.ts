import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../schemas';
import { ThinkThrooDatabase } from '../type';

// Next.js dev (Turbopack/webpack HMR) re-evaluates this module on every file
// change, which would otherwise open a brand new postgres connection pool
// each time without closing the old one — quickly exhausting the Supabase
// pooler's connection limit. Caching on `globalThis` survives HMR reloads.
const globalForDB = globalThis as unknown as { __thinkthrooDB?: ThinkThrooDatabase };

export const getDBInstance = (): ThinkThrooDatabase => {
  if (globalForDB.__thinkthrooDB) return globalForDB.__thinkthrooDB;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`You are trying to use database, but "DATABASE_URL" is not set correctly`);
  }

  const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  const db = drizzle(client, { schema });

  if (process.env.NODE_ENV !== 'production') {
    globalForDB.__thinkthrooDB = db;
  }

  return db;
};
