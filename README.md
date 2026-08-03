# Next.js React Query Template

Feature-driven Next.js 15 template with React Query, Biome, and Lefthook.

## Technologies

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TanStack React Query v5](https://tanstack.com/query/v5)
- [TanStack React Form](https://tanstack.com/form)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Biome](https://biomejs.dev/) (lint + format)
- [Lefthook](https://lefthook.dev/) (git hooks)

## Getting Started

```bash
# Create from template
npx create-next-app -e https://github.com/samudrajovanka/nextjs-react-query-template

# Install dependencies (auto-installs git hooks)
bun install

# Start dev server
bun dev
```

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun biome:check` | Lint + format + organize imports |
| `bun biome:lint` | Lint only |
| `bun biome:format` | Format only |
| `bun prepare:install` | Install git hooks |

## Project Structure

```
src/
├── app/                          # Next.js App Router (routes only)
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home route (SSR + hydration)
│   └── client/page.tsx            # Client-side example
├── features/                     # Feature modules (domain-driven)
│   ├── home/
│   │   ├── page/                  # Route page templates
│   │   │   └── HomePage.tsx
│   │   ├── components/            # Feature-specific components
│   │   │   └── dataUser/          # Organism: user data display
│   │   └── index.ts               # Barrel export
│   └── user/
│       ├── api/                   # Data fetching layer
│       ├── query/                 # React Query hooks
│       └── index.ts               # Barrel export
└── shared/                       # Cross-cutting code
    ├── assets/                    # Fonts, global styles
    ├── components/
    │   ├── atoms/                 # Smallest UI building blocks
    │   ├── molecules/             # Composed components
    │   │   └── query/             # QueryHandling wrapper
    │   └── organisms/             # Complex UI sections
    ├── config/                    # App configuration
    ├── lib/
    │   ├── helpers/               # Utilities (fetcher, metadata, queryClient)
    │   └── metadata/              # SEO metadata generator
    ├── providers/                 # App-level providers
    └── types/                     # Shared TypeScript types
```

## Architecture

### Feature-Driven

Each feature owns its domain logic — API calls, query hooks, types, and components are colocated:

```
features/<name>/
├── page/          Route page templates
├── components/    Feature-specific components
├── api/           Data fetching (fetch, axios, etc.)
├── query/         React Query hooks
└── index.ts       Public API (barrel export)
```

### Data Flow

```
Page (SSR) → prefetchQuery → HydrationBoundary → Component → useQuery → API
```

Server components prefetch data via `prefetchQuery`. The `HydrationBoundary` serializes cache to client. Client components call `useQuery` and receive cached data — no duplicate requests.

### Atomic Design (shared/components/ only)

- **atoms/** — Buttons, Inputs, Typography, Badges
- **molecules/** — Composed atoms (SearchBar, QueryHandling)
- **organisms/** — Complex sections (Headers, DataTables)

Feature components stay flat — no atomic nesting needed.

## Git Hooks

Lefthook runs `biome check` on staged files before commit:

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  jobs:
    - name: "biome check"
      glob: "src/*.{js,ts,jsx,tsx,json,css}"
      run: bun biome:check --no-errors-on-unmatched --colors=off {staged_files}
      stage_fixed: true
      skip:
        - merge
        - rebase
```

Skipped during merge/rebase. Local overrides via `lefthook-local.yml` (gitignored).
