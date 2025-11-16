# TODO: Update useMe Hook to Use TanStack Query

- [x] Update `src/hooks/useMe.ts` to use `useQuery` from `@tanstack/react-query`:
  - Import `useQuery`.
  - Replace manual state management (`useState`, `useEffect`) with `useQuery`.
  - Define query with key `['me']` and queryFn that fetches user data.
  - Use `onSuccess` to update the auth store with `setUser(data)`.
  - Return object with `user: query.data`, `loading: query.isLoading`, `error: query.error`, `refetch: query.refetch`.
  - Remove unused imports and code.
