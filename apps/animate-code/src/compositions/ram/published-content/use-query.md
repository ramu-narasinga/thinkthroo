## !!steps

!duration 100

```tsx ! a
// !callout[/useQuery/] The `useQuery` hook fetches and manages server data with caching and synchronization.
import { useQuery } from '@tanstack/react-query'

// Fetch user data using `useQuery`.
const { data, error, isLoading } = useQuery(
  ['user', userId],
  ({ signal }) => fetchUser(signal, userId)
)
```

## !!steps

!duration 120

```tsx ! b
// !callout[/useUserQuery/] Create a custom hook with options like `enabled` to control when the query should run.
export const useUserQuery = <TData = UserData>({
  enabled = true,
  ...options
}: UseQueryOptions<UserData, UserError, TData> = {}) => {
  return useQuery<UserData, UserError, TData>(
    ['user', userId],
    ({ signal }) => fetchUser(signal, userId),
    { enabled, ...options }
  )
}
```

## !!steps

!duration 120

```tsx ! c
// !callout[/prefetchUser/] Prefetch data to improve performance by using `prefetchQuery`.
export function prefetchUser(
	client: QueryClient, 
	userId: string
) {
  return client.prefetchQuery(
    ['user', userId],
    ({ signal }) => fetchUser(signal, userId)
  )
}

// Hook to trigger prefetching.
export function useUserPrefetch() {
  const client = useQueryClient()

  return useCallback((userId: string) => {
    prefetchUser(client, userId)
  }, [client])
}
```

## !!steps

!duration 100

```tsx ! d
export function setUserStatus(
  client: QueryClient,
  userId: string,
  status: string
) {
  // !callout[/setQueriesData/] Use `setQueriesData` to optimistically update cached data based on user actions.	
  client.setQueriesData<User[]>(
    ['users'],
    (old) => {
      if (!old) return old

      return old.map((user) => {
        if (user.id === userId) {
          return { ...user, status }
        }
        return user
      })
    },
    { updatedAt: Date.now() }
  )
}
```