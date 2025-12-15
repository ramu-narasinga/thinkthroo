import { NextRequest } from "next/dist/server/web/spec-extension/request";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const CODEARC_AUTH_HEADER = "x-codearc-auth";

export interface SupabaseAuth {
  user: User;
  sessionId?: string;
}

export interface AuthContext {
  authorizationHeader?: string | null;
  supabaseAuth?: SupabaseAuth | null;
  userAgent?: string;
  userId?: string | null;
  resHeaders?: Headers;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  supabaseAuth?: SupabaseAuth | null;
  userAgent?: string;
  userId?: string | null;
}): Promise<AuthContext> => {
  const responseHeaders = new Headers();

  return {
    authorizationHeader: params?.authorizationHeader,
    supabaseAuth: params?.supabaseAuth,
    userAgent: params?.userAgent,
    userId: params?.userId,
    resHeaders: responseHeaders,
  };
};

export type LambdaContext = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createLambdaContext = async (
  request: NextRequest
): Promise<LambdaContext> => {
  // Debug mode for development
  const isDebugApi = request.headers.get("x-codearc-debug") === "1";
  const isMockUser = process.env.ENABLE_MOCK_DEV_USER === "1";

  if (process.env.NODE_ENV === "development" && (isDebugApi || isMockUser)) {
    return {
      authorizationHeader: request.headers.get(CODEARC_AUTH_HEADER),
      userId: process.env.MOCK_DEV_USER_ID,
    };
  }

  console.log('Creating lambda context for request');

  // Get common context
  const authorization = request.headers.get(CODEARC_AUTH_HEADER);
  const userAgent = request.headers.get("user-agent") || undefined;

  const commonContext = {
    authorizationHeader: authorization,
    userAgent,
  };

  let userId: string | null = null;
  let supabaseAuth: SupabaseAuth | null = null;

  // Try Supabase authentication
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      userId = user.id;
      supabaseAuth = {
        user,
      };
    }
  } catch (error) {
    console.error("Supabase authentication failed:", error);
  }

  return await createContextInner({
    supabaseAuth,
    ...commonContext,
    userId,
  });
};
