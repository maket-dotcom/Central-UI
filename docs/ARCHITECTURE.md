# Central-UI Architecture & Coding Guidelines

This document outlines the standard practices, architecture patterns, and coding guidelines for the `Central-UI` repository. All future development must strictly adhere to these patterns to ensure consistency, type safety, and optimal performance.

## 1. Core Architecture Pattern: Service-Hook-Component
The repository follows a strict separation of concerns for all data fetching and mutation:

1. **Services (`src/services/*`)**: Pure, framework-agnostic functions that make API calls using the Axios `apiClient`. They only return raw data.
2. **React Query Hooks (`src/query/*`)**: React-specific hooks that wrap service calls, manage caching, handle invalidation, and trigger success/error toast notifications.
3. **UI Components (`src/pages/*`, `src/components/*`)**: Purely presentation layers. They **never** import services directly; they only consume React Query hooks and Zustand store data.

## 2. API Layer & Client Instances
- `src/api/apiClient.ts` provides a generic factory function `createApiClient` that wraps Axios instances.
- **NEVER** use `useApi` as a name, as it violates React's `rules-of-hooks` since it is a factory function, not a hook.
- Different backend servers have their own configured instances (e.g., `centralInstance.ts`, `appInstance.ts`) which automatically inject the appropriate Zustand authorization tokens.

## 3. The Destructured Object Payload Pattern (Strict)
Every service and React Query mutation must accept **exactly one destructured object argument**. This is a hard requirement for consistency.

### Services Example
```typescript
// ✅ CORRECT
export const updateApp = async ({ id, body }: { id: string, body: Record<string, unknown> }) => {
  const { data } = await api.patch("updateApp", body, {}, { id });
  return data;
}

// ❌ INCORRECT
export const updateApp = async (id: string, body: Record<string, unknown>) => { ... }
```

### React Query Mutations Example
When defining `mutationFn` in React Query, use explicit arrow-function payload passing:
```typescript
// ✅ CORRECT
export const useUpdateApp = () => {
  return useMutation({
    mutationFn: (payload: { id: string; body: Record<string, unknown> }) => updateApp(payload),
    onSuccess: () => { ... }
  });
}

// ❌ INCORRECT (Do not pass the function reference directly)
export const useUpdateApp = () => {
  return useMutation({
    mutationFn: updateApp,
  });
}
```

## 4. Zod Validation (V4 Standards)
All form and data validations are handled via `zod`. We follow the modern Zod v4+ syntax, specifically regarding string refinements:

```typescript
// ✅ CORRECT
const schema = z.object({
  link: z.string().pipe(z.url({ message: "Invalid URL format" }))
});

// ❌ INCORRECT (Deprecated)
const schema = z.object({
  link: z.string().url({ message: "Invalid URL format" })
});
```

## 5. React 18 Performance Rules (No Cascading Renders)
We strictly enforce React 18 performance best practices regarding `useEffect`.
- **NEVER** synchronously call state setters (`setState`) inside a `useEffect` if the state can be derived during the render phase or initialized directly.
- **Why?** Doing so triggers cascading re-renders that damage UI performance.

```typescript
// ✅ CORRECT (Derive in render)
const [openTitle, setOpenTitle] = useState<string | null>(null);
const [prevPath, setPrevPath] = useState(currentPath);

if (currentPath !== prevPath) {
  setPrevPath(currentPath);
  setOpenTitle(computeTitle(currentPath));
}

// ❌ INCORRECT (Cascading render)
const [openTitle, setOpenTitle] = useState<string | null>(null);
useEffect(() => {
  setOpenTitle(computeTitle(currentPath));
}, [currentPath]);
```

## 6. Type Safety
- **Avoid `any` or `object`**: Use explicit interfaces, Zod inferred types (`z.infer<typeof schema>`), or `Record<string, unknown>` for generic objects.
- All API payloads and responses must be strictly typed to avoid `@typescript-eslint/no-explicit-any` errors.

## 7. Global State (Zustand)
Global state is managed via `Zustand` in `src/store/`.
- Slices are used to separate domains (e.g., `AppSlice.ts`, `AuthSlice.ts`).
- Auth tokens and selected apps are persisted via `localStorage` directly in the slice initializers.
- Interceptors in `src/api/*` dynamically read the latest state via `useAppStore.getState().token`.
