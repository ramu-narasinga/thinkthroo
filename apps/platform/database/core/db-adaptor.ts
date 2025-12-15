import { ThinkThrooDatabase } from '../type';
import { getDBInstance } from './web-server';

/**
 * Lazy-load database instance
 * Avoid initializing the database every time the module is imported
 */
let cachedDB: ThinkThrooDatabase | null = null;

export const getServerDB = async (): Promise<ThinkThrooDatabase> => {
  // If there's already a cached instance, return it directly
  if (cachedDB) return cachedDB;

  try {
    cachedDB = getDBInstance();
    return cachedDB;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const serverDB = getDBInstance();