# Data Fetching Standards

## CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

Data fetching is **NOT ALLOWED** via:
- Route handlers (`/api/*`)
- Client components (`"use client"`)
- Any other method

This is non-negotiable. Server components provide the most secure and performant way to fetch data in Next.js.

## Database Query Architecture

### Helper Functions in `/data`

All database queries MUST be performed through helper functions located in the `/data` directory. These functions:

1. **Use Drizzle ORM exclusively** - DO NOT USE RAW SQL
2. **Are called only from Server Components**
3. **Handle all data access logic in one place**

Example structure:
```
/data
  /workouts.ts    # Workout-related queries
  /exercises.ts   # Exercise-related queries
  /users.ts       # User-related queries
```

### Example Helper Function

```typescript
// data/workouts.ts
import { db } from "@/src/db";
import { workouts } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsByUserId(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ALWAYS filter by userId
      )
    );
  return result[0] ?? null;
}
```

### Using in Server Components

```typescript
// app/workouts/page.tsx
import { getWorkoutsByUserId } from "@/data/workouts";
import { auth } from "@/auth"; // or your auth solution

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const workouts = await getWorkoutsByUserId(session.user.id);

  return <WorkoutsList workouts={workouts} />;
}
```

## CRITICAL: User Data Isolation

**A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data.**

### Mandatory Rules

1. **EVERY database query MUST filter by `userId`** - No exceptions
2. **NEVER trust client-provided user IDs** - Always use the authenticated session's user ID
3. **Validate ownership before any read, update, or delete operation**

### Pattern for All Queries

```typescript
// CORRECT - Always include userId filter
export async function getExerciseById(exerciseId: string, userId: string) {
  return db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.id, exerciseId),
        eq(exercises.userId, userId) // Required for security
      )
    );
}

// WRONG - Never do this
export async function getExerciseById(exerciseId: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId)); // Missing userId - SECURITY VULNERABILITY
}
```

### Updates and Deletes

The same rule applies to mutations:

```typescript
// CORRECT
export async function deleteWorkout(workoutId: string, userId: string) {
  return db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // Prevents deleting other users' data
      )
    );
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Data fetching location | Server Components ONLY |
| Query implementation | Helper functions in `/data` |
| ORM | Drizzle ORM (NO raw SQL) |
| User data access | ALWAYS filter by authenticated userId |
| Trust client input | NEVER for user identification |
