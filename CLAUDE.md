# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
