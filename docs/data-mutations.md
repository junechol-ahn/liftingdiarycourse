# Data Mutation Standards

## CRITICAL: Server Actions Only

**ALL data mutations in this application MUST be done via Server Actions.**

Data mutations are **NOT ALLOWED** via:
- Route handlers (`/api/*`)
- Client-side fetch calls
- Direct database calls from components

## Architecture Overview

Data mutations follow a two-layer architecture:

1. **Server Actions** (`actions.ts`) - Handle validation, authentication, and call helper functions
2. **Helper Functions** (`/src/data/*`) - Wrap Drizzle ORM database operations

```
┌─────────────────────────────────────────────────────────┐
│  Client Component                                       │
│  └── calls server action                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Server Action (actions.ts)                             │
│  └── validates with Zod                                 │
│  └── authenticates user                                 │
│  └── calls helper function                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Helper Function (/src/data/*)                          │
│  └── executes Drizzle ORM query                         │
└─────────────────────────────────────────────────────────┘
```

## Helper Functions in `/src/data`

All database mutations MUST be performed through helper functions in the `/src/data` directory.

### Rules

1. **Use Drizzle ORM exclusively** - DO NOT USE RAW SQL
2. **One file per domain** - Group related mutations together
3. **Always include userId parameter** - For user data isolation

### Example Structure

```
/src/data
  /workouts.ts    # Workout mutations
  /exercises.ts   # Exercise mutations
  /sets.ts        # Set mutations
```

### Example Helper Functions

```typescript
// src/data/workouts.ts
import { db } from "@/src/db";
import { workoutsTable } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(data: {
  userId: string;
  name?: string;
  notes?: string;
}) {
  const result = await db
    .insert(workoutsTable)
    .values({
      userId: data.userId,
      name: data.name,
      notes: data.notes,
    })
    .returning();
  return result[0];
}

export async function updateWorkout(
  workoutId: number,
  userId: string,
  data: { name?: string; notes?: string; completedAt?: Date }
) {
  const result = await db
    .update(workoutsTable)
    .set(data)
    .where(
      and(
        eq(workoutsTable.id, workoutId),
        eq(workoutsTable.userId, userId) // ALWAYS filter by userId
      )
    )
    .returning();
  return result[0] ?? null;
}

export async function deleteWorkout(workoutId: number, userId: string) {
  const result = await db
    .delete(workoutsTable)
    .where(
      and(
        eq(workoutsTable.id, workoutId),
        eq(workoutsTable.userId, userId) // ALWAYS filter by userId
      )
    )
    .returning();
  return result[0] ?? null;
}
```

## Server Actions

### CRITICAL: Colocated `actions.ts` Files

All server actions MUST be defined in files named `actions.ts` colocated with the route/feature they serve.

### Example Structure

```
/app
  /workouts
    /page.tsx
    /actions.ts     # Server actions for workouts
  /workouts/[id]
    /page.tsx
    /actions.ts     # Server actions for single workout
```

### CRITICAL: Typed Parameters (NO FormData)

Server action parameters MUST be explicitly typed. **DO NOT use `FormData`** as a parameter type.

```typescript
// CORRECT - Typed parameters
export async function createWorkoutAction(data: {
  name?: string;
  notes?: string;
}) {
  // ...
}

// WRONG - Never use FormData
export async function createWorkoutAction(formData: FormData) {
  // DO NOT DO THIS
}
```

### CRITICAL: Zod Validation

**ALL server actions MUST validate their arguments using Zod.**

### CRITICAL: No Redirects in Server Actions

**DO NOT use `redirect()` from `next/navigation` inside server actions.** Redirects must be handled client-side after the server action resolves.

```typescript
// WRONG - Never redirect inside server actions
export async function createWorkoutAction(data: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in"); // DO NOT DO THIS
  }
  // ...
}

// CORRECT - Return error and redirect client-side
export async function createWorkoutAction(data: { name: string }) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }
  // ...
}
```

Client-side handling:

```typescript
"use client";

import { useRouter } from "next/navigation";

export function CreateWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const result = await createWorkoutAction({ name: "..." });

    if (!result.success) {
      if (result.error === "Unauthorized") {
        router.push("/sign-in"); // Redirect client-side
        return;
      }
      // Handle other errors
    }

    // Redirect on success
    router.push("/workouts");
  }
}
```

```typescript
// app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout, updateWorkout, deleteWorkout } from "@/src/data/workouts";

// Define schemas
const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).optional(),
});

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).optional(),
  completedAt: z.coerce.date().optional(),
});

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Server Actions
export async function createWorkoutAction(data: {
  name?: string;
  notes?: string;
}): Promise<ActionResult<{ id: number }>> {
  // 1. Validate input
  const result = createWorkoutSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Validation failed" };
  }

  // 2. Authenticate
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 3. Call helper function
  try {
    const workout = await createWorkout({
      userId,
      ...result.data,
    });

    // 4. Revalidate and return
    revalidatePath("/workouts");
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: "Failed to create workout" };
  }
}

export async function updateWorkoutAction(data: {
  workoutId: number;
  name?: string;
  notes?: string;
  completedAt?: Date;
}): Promise<ActionResult<{ id: number }>> {
  const result = updateWorkoutSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Validation failed" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workout = await updateWorkout(
      result.data.workoutId,
      userId,
      {
        name: result.data.name,
        notes: result.data.notes,
        completedAt: result.data.completedAt,
      }
    );

    if (!workout) {
      return { success: false, error: "Workout not found" };
    }

    revalidatePath("/workouts");
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: "Failed to update workout" };
  }
}

export async function deleteWorkoutAction(data: { workoutId: number }): Promise<ActionResult<null>> {
  const result = deleteWorkoutSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Validation failed" };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteWorkout(result.data.workoutId, userId);
    revalidatePath("/workouts");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete workout" };
  }
}
```

### Error Handling Pattern

Handle validation errors gracefully and return structured responses:

```typescript
"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createWorkoutAction(data: {
  name: string;
}): Promise<ActionResult<{ id: number }>> {
  // Validate
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message ?? "Validation failed",
    };
  }

  // Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Execute
  try {
    const workout = await createWorkout({
      userId: session.user.id,
      name: result.data.name,
    });

    revalidatePath("/workouts");
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: "Failed to create workout" };
  }
}
```

### Using Server Actions in Client Components

```typescript
"use client";

import { createWorkoutAction } from "./actions";

export function CreateWorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Convert FormData to typed object before calling action
    const result = await createWorkoutAction({
      name: formData.get("name") as string,
    });

    if (!result.success) {
      // Handle error
      console.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" />
      <button type="submit">Create</button>
    </form>
  );
}
```

## CRITICAL: User Data Isolation

The same security rules from data fetching apply to mutations:

1. **EVERY mutation MUST include `userId` filter** - No exceptions
2. **NEVER trust client-provided user IDs** - Always use authenticated session
3. **Validate ownership before any update or delete**

## Summary

| Rule | Requirement |
|------|-------------|
| Mutation location | Server Actions ONLY |
| Action file naming | `actions.ts` (colocated) |
| Action parameters | Typed objects (NO FormData) |
| Validation | Zod (REQUIRED for ALL actions) |
| Redirects | Client-side ONLY (NO `redirect()` in server actions) |
| Database operations | Helper functions in `/src/data` |
| ORM | Drizzle ORM (NO raw SQL) |
| User data access | ALWAYS filter by authenticated userId |
