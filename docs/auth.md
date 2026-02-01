# Authentication Standards

## Authentication Provider

This project uses **Clerk** (`@clerk/nextjs`) as the exclusive authentication provider.

### Rules

1. **ONLY use Clerk for authentication** - Do not implement custom auth solutions
2. **Use Clerk's built-in components** - Prefer `SignInButton`, `SignUpButton`, `UserButton`, etc.
3. **Never store passwords or sensitive auth data** - Clerk handles all credential management

## Setup

### ClerkProvider

The `ClerkProvider` must wrap the entire application in the root layout (`app/layout.tsx`):

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

Clerk middleware is configured in `middleware.ts` at the project root:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Getting the User ID

### In Server Components

Use the `auth()` function from `@clerk/nextjs/server`:

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Use userId for data fetching
  const data = await getDataByUserId(userId);
}
```

### In Client Components

Use the `useUser()` hook:

```typescript
"use client";

import { useUser } from "@clerk/nextjs";

export function ClientComponent() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return <div>Hello, {user.firstName}</div>;
}
```

## UI Components

### Conditional Rendering

Use `SignedIn` and `SignedOut` components to conditionally render content:

```typescript
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

### Available Components

| Component | Purpose |
|-----------|---------|
| `SignInButton` | Triggers sign-in flow |
| `SignUpButton` | Triggers sign-up flow |
| `SignOutButton` | Signs out the user |
| `UserButton` | Shows user avatar with dropdown menu |
| `SignedIn` | Renders children only when signed in |
| `SignedOut` | Renders children only when signed out |

## Protecting Routes

### Protecting Server Components

Always check for authentication at the top of protected pages:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Rest of the component
}
```

### Protecting Route Groups

Use Clerk's middleware configuration to protect entire route groups. See Clerk documentation for advanced matcher patterns.

## Environment Variables

Required environment variables (stored in `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**NEVER commit these keys to version control.**

## Summary

| Rule | Requirement |
|------|-------------|
| Auth provider | Clerk ONLY |
| User ID in Server Components | `auth()` from `@clerk/nextjs/server` |
| User ID in Client Components | `useUser()` hook |
| Conditional rendering | `SignedIn` / `SignedOut` components |
| Route protection | Check `userId` and redirect if null |
