# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**ALWAYS read the relevant documentation in `/docs` before generating any code.** The docs directory contains project standards and conventions that must be followed. Refer to these files first to ensure all generated code adheres to established patterns.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md

## Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx drizzle-kit push` - Push schema changes directly to database
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Apply migrations to database
- `npx drizzle-kit studio` - Open Drizzle Studio GUI

## Architecture

This is a Next.js 16 project using the App Router with:
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling
- **ESLint 9** with Next.js core-web-vitals and TypeScript configs
- **Drizzle ORM** with Neon serverless PostgreSQL

Path alias `@/*` maps to the project root.

## Database

Schema is defined in `src/db/schema.ts`. Database connection is exported from `src/db/index.ts`.

## UI Standards

See `docs/ui.md` for UI coding standards. Key points:
- **ONLY use shadcn/ui components** - No custom components
- **Date formatting** via date-fns using format `do MMM yyyy` (e.g., "1st Sep 2025")

## Authentication

See `docs/auth.md` for authentication standards. Key points:
- **Clerk** is the exclusive authentication provider
- Use `auth()` from `@clerk/nextjs/server` in Server Components
- Use `useUser()` hook in Client Components
