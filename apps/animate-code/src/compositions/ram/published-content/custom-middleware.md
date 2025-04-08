!videoTitle Understanding Custom Middleware in tRPC

## !!steps
!duration 200

!title 1. Defining Middleware in tRPC

```ts ! trpc/middleware.ts
// !callout[/TRPCError/] Middleware in tRPC is used to extend request handling, such as logging or authentication.
import { TRPCError } from '@trpc/server';

export 
  const 
  authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next();
});
```

## !!steps
!duration 210

!title 2. Attaching Middleware to Procedures

```ts ! trpc/routes.ts
// !callout[/protectedProcedure/] Middleware is applied to procedures to enforce logic like authorization.
export const protectedProcedure = t.procedure
  .use(authMiddleware)
  .query(() => {
    return 'Protected data!';
  });
```

## !!steps
!duration 220

!title 3. Context Setup for Middleware

```ts ! trpc/context.ts
// !callout[/createContext/] Middleware relies on `ctx`, so it is important to pass relevant data such as the `user` object.
export const createContext = ({ req }) => {
  return {
    user: req.user, // Inject user into context
  };
};
```

## !!steps
!duration 200

!title 4. Handling Errors in Middleware

```ts ! trpc/middleware.ts
// !callout[/ctx/] Middleware can throw `TRPCError` to handle issues like unauthorized access.
if (!ctx.user) {
  throw new TRPCError({ 
    code: 'UNAUTHORIZED', 
    message: 'User not authenticated' 
  });
}
```

## !!steps
!duration 200

!title 5. Practical Middleware Example in tRPC

```ts ! trpc/routes.ts
// !callout[/appRouter/] Combining middleware and procedures for enhanced request handling.
export const appRouter = t.router({
  getProtectedData: protectedProcedure,
});
```