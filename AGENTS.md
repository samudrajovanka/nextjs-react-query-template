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
│   ├── api/                # Data fetching (fetch, axios, etc.)
│   ├── query/              # React Query hooks + keys
│   └── index.ts            # Barrel export (public API)
└── shared/                 # Cross-cutting code
    ├── assets/             # Fonts, global CSS
    ├── components/         # Atomic design: atoms → molecules → organisms
    ├── config/             # App configuration constants
    ├── lib/helpers/        # Utilities (fetcher, metadata, queryClient)
    ├── providers/          # App-level providers (QueryClient, Theme, etc.)
    └── types/              # Shared TypeScript types
```

### Feature Conventions

- Each feature is a self-contained module under `features/<name>/`.
- Feature barrel (`index.ts`) exports only the public API — no internal leaks.
- Route pages live in `features/<name>/page/` and are imported by `app/` routes.
- Feature components stay **flat** (no atomic nesting). Atomic design is for `shared/components/` only.

### Atomic Design (shared/components/ only)

```
shared/components/
├── atoms/         Button, Input, Typography, Badge — never compose others
├── molecules/     QueryHandling, SearchBar, FormGroup — compose atoms
└── organisms/     Header, DataTable, Footer — compose molecules
```

## Data Flow

```
Server Component → prefetchQuery → HydrationBoundary → Client Component → useQuery
```

- Server components prefetch via `getQueryClient().prefetchQuery()`.
- `HydrationBoundary` serializes cache from server to client.
- Client components call `useQuery()` — receives cached data, no duplicate requests.
- API layer (`features/<name>/api/`) handles raw fetch — never import `@tanstack/react-query` here.

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

# 3. Add API layer
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
