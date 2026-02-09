import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/utils/logger";

/**
 * Supabase Database Service
 * Singleton pattern to manage database connections
 * Uses service role to bypass RLS policies for GitHub App operations
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      const error = "Missing Supabase credentials";
      logger.error(error, {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
      });
      throw new Error(error);
    }

    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info("Supabase service initialized", {
      url: supabaseUrl.substring(0, 30) + "...",
    });
  }

  /**
   * Get singleton instance of SupabaseService
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Get the Supabase client
   */
  public getClient(): SupabaseClient {
    return this.client;
  }

}
