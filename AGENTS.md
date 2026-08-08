# AGENTS.md

## Package Manager

Use **bun** for all package operations.

```bash
bun add <package>
bun add -D <dev-package>
bun remove <package>
```

## Linting & Formatting

Run Biome before committing. Lefthook does this automatically.

```bash
bun biome:check    # Lint + format + organize imports (full check)
bun biome:lint     # Lint only
bun biome:format   # Format only
```

Never bypass the pre-commit hook (`--no-verify`). If Biome flags something, fix it.

## TypeScript

- Strict mode enabled (`tsconfig.json`).
- Never use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- Type imports use `import type` for type-only imports.

## Project Structure

```
src/
├── app/                    # Next.js App Router (routes only, no business logic)
├── features/<name>/        # Feature modules (self-contained domains)
│   ├── page/               # Route page templates
│   ├── components/         # Feature-specific components
│   ├── api/                # Data fetching (uses ApiClient)
│   ├── query/              # React Query hooks + keys
│   └── index.ts            # Barrel export (public API)
└── shared/                 # Cross-cutting code
    ├── assets/             # Fonts, global CSS
    ├── components/         # Atomic design: atoms → molecules → organisms
    ├── config/             # App configuration constants
    ├── lib/helpers/        # Utilities (apiClient, field, metadata, queryClient)
    ├── providers/          # App-level providers (QueryClient, Theme, etc.)
    └── types/              # Shared TypeScript types
```

### Feature Conventions

- Each feature is a self-contained module under `features/<name>/`.
- Feature barrel (`index.ts`) exports only the public API — no internal leaks.
- Route pages live in `features/<name>/page/` and are imported by `app/` routes.
- Feature components stay **flat** (no atomic nesting). Atomic design is for `shared/components/` only.
- Feature API layer creates its own `ApiClient` instance or uses the shared default:

```typescript
// features/<name>/api/index.ts
import ApiClient from '@/shared/lib/helpers/apiClient';

const api = new ApiClient({ baseUrl: '/api' });

export const getItems = async () => {
  return await api.get<Item[]>('/items');
};
```

### Atomic Design (shared/components/ only)

```
shared/components/
├── atoms/         Button, Input, Typography, Badge — never compose others
├── molecules/     QueryHandling, SearchBar, FormGroup — compose atoms
└── organisms/     Header, DataTable, Footer — compose molecules
```

## Tailwind CSS

This template uses **Tailwind CSS v4** with CSS-first configuration. There is no `tailwind.config.ts` — all theme tokens live in `globals.css`.

**PostCSS (`postcss.config.mjs`):**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};
```

**CSS entry (`src/shared/assets/styles/globals.css`):**

```css
@import "tailwindcss";

@theme {
  --font-inter: var(--font-inter-variable), sans-serif;
  /* add custom tokens here */
}
```

Add custom design tokens (colors, breakpoints, fonts) inside `@theme`. No `tailwind.config.ts` needed. Automatic content detection — no `content` array to maintain.

### Custom CSS — Folder Structure

Organize custom styles into subdirectories under `styles/` and import them into `globals.css`. This keeps each concern isolated and avoids a bloated `globals.css`.

> **Docs:** [tailwindcss.com/docs/adding-custom-styles](https://tailwindcss.com/docs/adding-custom-styles)

**`globals.css` is the single entry point** — import all files directly here. Do NOT create barrel/index CSS files per folder; that adds an extra layer of indirection without benefit.

```
shared/assets/styles/
├── components/        # Semantic component classes (@layer components)
│   ├── text.css
│   ├── layout.css
│   └── field.css
├── utility/           # Custom utilities (@utility)
│   └── sidebar.css
└── globals.css        # Entry point — imports everything
```

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --font-inter: var(--font-inter-variable), sans-serif;
}

/* components — @layer components, always included */
@import "./components/text.css" layer(components);
@import "./components/layout.css" layer(components);
@import "./components/field.css" layer(components);

/* utilities — uses @utility inside, no layer() needed */
@import "./utility/sidebar.css";
```

**`@layer components`** — for reusable semantic classes (`.btn`, `.card`). Always included in output, can be overridden by Tailwind utilities:

```css
/* components/field.css */
@layer components {
  .field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
}
```

**`@utility`** — for custom utility classes. Tree-shaken (removed if unused) and automatically support variants like `hover:`, `md:`, `dark:`:

```css
/* utility/sidebar.css */
@utility sidebar-collapsed {
  width: 4rem;
  overflow: hidden;
}
```

| | `@layer components` | `@utility` |
|---|---|---|
| Tree-shaken | ❌ always included | ✅ removed if unused |
| Variants (`hover:`, `md:`) | ❌ manual | ✅ automatic |
| Best for | Semantic component blocks | Single-purpose functional classes |

**When to add a new file:** Create a new file per concern (e.g. `components/badge.css`) and add its `@import` line to `globals.css`. Never import sub-files from within another sub-file.

## shadcn/ui

When adding shadcn/ui to this project, configure `components.json` so generated components land in the correct atomic-design layer under `shared/components/`.

### Installation

```bash
bunx shadcn@latest init
```

### components.json — path configuration

This project uses **Tailwind v4** (CSS-first, no config file). Set `tailwind.config` to `""` in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/shared/assets/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components/atoms",
    "utils": "@/shared/lib/helpers/utils",
    "ui": "@/shared/components/atoms",
    "lib": "@/shared/lib",
    "hooks": "@/shared/lib/hooks"
  }
}
```

> **Key rule:** shadcn components are atomic UI primitives — they always go into `shared/components/atoms/`. Never point the alias at `molecules/` or `organisms/`.

### Adding a component

```bash
bunx shadcn@latest add button
# → generated at src/shared/components/atoms/button.tsx
```

### Placement rules

| Component type | Where it goes | Example |
|---|---|---|
| shadcn primitive (Button, Input, Badge…) | `shared/components/atoms/` | `atoms/button.tsx` |
| Composed from shadcn atoms | `shared/components/molecules/` | `molecules/combobox/` |
| Complex sections using molecules | `shared/components/organisms/` | `organisms/dataTable/` |
| Feature-specific UI (uses shadcn internally) | `features/<name>/components/` | stays flat, no atomic nesting |

## ApiClient

Class-based HTTP client with pluggable auth. See `shared/lib/helpers/apiClient/`.

```typescript
import ApiClient from '@/shared/lib/helpers/apiClient';
import ApiAuthProvider, {
  BearerAuthStrategy
} from '@/shared/lib/helpers/apiClient/ApiAuthProvider';

const authProvider = new ApiAuthProvider({
  bearer: new BearerAuthStrategy(() => getAccessToken())
});

const api = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  authProvider,
  defaultAuthType: 'bearer'
});

await api.get<User[]>('/users', { params: { page: 1 } });
await api.post<User>('/users', { name: 'Jovan' });
await api.put<User>('/users/1', { name: 'Updated' });
await api.patch<User>('/users/1', { name: 'Partial' });
await api.delete('/users/1');
```

- `get/post/put/patch/delete` accept `Omit<RequestOptions, 'method' | 'body'>` for `params`, `authType`, `headers`.
- Auth strategies: `bearer`, `basic`, `apiKey`. Per-request override via `authType` option.
- Default instance: `apiClient`. Feature-specific instances in `features/<name>/api/`.

## QueryHandling Component

Declarative wrapper for `useQuery` results (`shared/components/molecules/query/`). Renders loading, error, empty, not-found, forbidden, and success states:

```tsx
import { QueryHandling } from '@/shared/components/molecules/query';

<QueryHandling
  queryResult={usersQuery}
  renderLoading={<Spinner />}
  renderError={<ErrorAlert />}
  renderEmpty={<EmptyState />}
  renderNotFound={<NotFound />}
  render={({ data: users }) => <UserList users={users} />}
/>
```

**Props:**
| Prop | Type | Default |
|---|---|---|
| `queryResult` | `UseQueryResult<T>` | required |
| `render` | `(data: T) => ReactNode` | required |
| `renderLoading` | `ReactNode` | `<p>Loading...</p>` |
| `renderError` | `ReactNode` | `<p>error message</p>` |
| `renderEmpty` | `ReactNode` | — |
| `renderNotFound` | `ReactNode` | `<p>Data not found</p>` |
| `renderForbidden` | `ReactNode` | `<p>Access forbidden</p>` |
| `bypassForbidden` | `boolean` | `true` |
| `checkEmpty` | `(data: T) => boolean` | — |

**When to use:** Single query with standard UI states. Quick to wire up, consistent error handling.

**When NOT to use:** Multiple queries in one view. QueryHandling wraps **one** query. Nesting creates separate loading states per query. For 2+ queries, handle manually:

```tsx
// ❌ Separate loading states for each query
<QueryHandling queryResult={usersQuery} render={...}>
  <QueryHandling queryResult={postsQuery} render={...} />
</QueryHandling>

// ✅ Single loading state for all queries
const Page = () => {
  const usersQuery = useUsers();
  const postsQuery = usePosts();

  if (usersQuery.isLoading || postsQuery.isLoading) return <Loading />;
  if (usersQuery.isError || postsQuery.isError) return <ErrorAlert />;

  return (
    <>
      <UserList users={usersQuery.data!.data} />
      <PostList posts={postsQuery.data!.data} />
    </>
  );
};
```

## Data Flow

```
Server Component → prefetchQuery → HydrationBoundary → Client Component → useQuery
```

- Server components prefetch via `getQueryClient().prefetchQuery()`.
- `HydrationBoundary` serializes cache from server to client.
- Client components call `useQuery()` — receives cached data, no duplicate requests.
- API layer (`features/<name>/api/`) uses `ApiClient` — never import `@tanstack/react-query` here.

## Imports

- Path alias: `@/` maps to `./src/`.
- Prefer `@/` imports over deep relative imports (`../../`).
- Barrel imports from `index.ts` when available.
- CSS imports go at the top of the import list.

### Import Order (Biome enforces this)

```
1. CSS/side-effect imports ('@/shared/assets/styles/globals.css')
2. External packages ('react', '@tanstack/react-query')
3. Internal aliased ('@/features/...', '@/shared/...')
4. Relative imports ('./types', '../components/...')
```

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files | PascalCase for components, camelCase for utilities | `HomePage.tsx`, `queryClient.ts` |
| Directories | camelCase | `dataUser/`, `queryClient/` |
| Components | PascalCase, default export | `export default HomePage` |
| Hooks | `use` prefix | `useUsers`, `useAuth` |
| Query keys | `get<Name>Key` | `getUsersKey` |
| API functions | `get<Name>`, `create<Name>`, etc. | `getUsers`, `createUser` |

## Git Workflow

- Lefthook runs `biome check --write` on staged files at `pre-commit`.
- Auto-staged fixes — no manual formatting needed.
- Hook skips during merge/rebase.
- Local overrides via `lefthook-local.yml` (gitignored).

## Adding a New Feature

```bash
# 1. Create feature directory
mkdir -p src/features/<name>/{page,components,api,query}

# 2. Create barrel export
# src/features/<name>/index.ts

# 3. Create feature ApiClient instance
# src/features/<name>/api/index.ts
# src/features/<name>/api/types.ts

# 4. Add query hooks
# src/features/<name>/query/index.ts

# 5. Add page component
# src/features/<name>/page/<Name>Page.tsx

# 6. Add route in app/
# src/app/<name>/page.tsx → imports from @/features/<name>

# 7. Run checks
bun biome:check
bun run build
```
