import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { LambdaRouter } from "@/server/routers/lambda";

const customHttpBatchLink = httpBatchLink({
  fetch: async (input, init) => {
    return await fetch(input, init as RequestInit);
  },
  async headers() {
    return {
      // authorization: getAuthCookie(),
    };
  },
  maxURLLength: 2083,
  transformer: superjson,
  url: `/api/trpc/lambda`,
});

const links = [customHttpBatchLink];

export const lambdaClient = createTRPCClient<LambdaRouter>({
  links,
});

export const lambdaQuery = createTRPCReact<LambdaRouter>();

export const lambdaQueryClient = lambdaQuery.createClient({ 
  links,
});