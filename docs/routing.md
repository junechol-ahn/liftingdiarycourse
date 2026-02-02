# Routing Standards

## Route Structure

All application routes are accessed via `/dashboard`. The root path `/` is reserved for public landing/marketing pages only.

```
/                           # Public landing page
/dashboard                  # Protected - Main dashboard
/dashboard/workout/new      # Protected - Create new workout
/dashboard/workout/[id]     # Protected - View/edit workout
```

## Route Protection

All `/dashboard` routes and their sub-routes are protected and require user authentication.

### Implementation

Route protection is handled via **Next.js middleware** using Clerk's `clerkMiddleware()`.

```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Rules

1. **All `/dashboard` routes must be protected** - Users must be logged in to access any dashboard page
2. **Use middleware for protection** - Do NOT implement route protection at the page level; rely on the middleware
3. **Public routes stay at root** - Landing pages, marketing, and public content should not be under `/dashboard`

## Adding New Routes

When creating new protected routes:

1. Place them under `app/dashboard/`
2. The middleware automatically protects them - no additional configuration needed
3. Follow Next.js App Router conventions for dynamic routes (e.g., `[workoutId]`)
