import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../schemas';
import { ThinkThrooDatabase } from '../type';

export const getDBInstance = (): ThinkThrooDatabase => {

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(`You are trying to use database, but "DATABASE_URL" is not set correctly`);
  }

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(client, { schema });
};
