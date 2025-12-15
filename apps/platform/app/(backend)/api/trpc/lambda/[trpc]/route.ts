import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

import { pino } from '@/lib/logger';
import { createLambdaContext } from '@/lib/trpc/lambda/context';
import { prepareRequestForTRPC } from '@/lib/trpc/utils/request-adapter';
import { lambdaRouter } from '@/server/routers/lambda';

const handler = async (req: NextRequest) => {
  console.log('tRPC lambda handler invoked');
  // Clone the request to avoid "Response body object should not be disturbed or locked" error
  // in Next.js 16 when the body stream has been consumed by Next.js internal mechanisms
  const preparedReq = prepareRequestForTRPC(req);

  // DEBUG: inspect the text body seen by tRPC adapter
  try {
    const cloned = preparedReq.clone();
    const bodyText = await cloned.text();
    console.log('*** preparedReq bodyText:', bodyText || '<empty>');
  } catch (err) {
    console.warn('*** Could not read preparedReq body for debug:', err);
  }

  return fetchRequestHandler({
    /**
     * @link https://trpc.io/docs/v11/context
     */
    createContext: () => createLambdaContext(req),

    endpoint: '/api/trpc/lambda',

    onError: ({ error, path, type }) => {
      pino.info(`Error in tRPC handler (lambda) on path: ${path}, type: ${type}`);
      console.error(JSON.stringify(error));
    },

    req: preparedReq,
    responseMeta({ }) {
    //   const headers = ctx?.resHeaders;

      return {  };
    },
    router: lambdaRouter,
  });
};

export { handler as GET, handler as POST };