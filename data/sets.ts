import { db } from "@/src/db";
import {
  setsTable,
  workoutExercisesTable,
  workoutsTable,
} from "@/src/db/schema";
import { eq, and, max } from "drizzle-orm";

export async function createSet(
  data: {
    workoutExerciseId: number;
    reps?: number;
    weight?: string;
  },
  userId: string
) {
  // Verify ownership through workout_exercises -> workouts chain
  const workoutExercise = await db
    .select({
      id: workoutExercisesTable.id,
    })
    .from(workoutExercisesTable)
    .innerJoin(
      workoutsTable,
      eq(workoutExercisesTable.workoutId, workoutsTable.id)
    )
    .where(
      and(
        eq(workoutExercisesTable.id, data.workoutExerciseId),
        eq(workoutsTable.userId, userId)
      )
    );

  if (workoutExercise.length === 0) {
    return null;
  }

  // Get the current max set number
  const maxSetResult = await db
    .select({ maxSetNumber: max(setsTable.setNumber) })
    .from(setsTable)
    .where(eq(setsTable.workoutExerciseId, data.workoutExerciseId));

  const nextSetNumber = (maxSetResult[0]?.maxSetNumber ?? 0) + 1;

  const result = await db
    .insert(setsTable)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: nextSetNumber,
      reps: data.reps,
      weight: data.weight,
    })
    .returning();

  return result[0];
}

export async function updateSet(
  setId: number,
  data: { reps?: number; weight?: string },
  userId: string
) {
  // Verify ownership through sets -> workout_exercises -> workouts chain
  const set = await db
    .select({
      id: setsTable.id,
    })
    .from(setsTable)
    .innerJoin(
      workoutExercisesTable,
      eq(setsTable.workoutExerciseId, workoutExercisesTable.id)
    )
    .innerJoin(
      workoutsTable,
      eq(workoutExercisesTable.workoutId, workoutsTable.id)
    )
    .where(and(eq(setsTable.id, setId), eq(workoutsTable.userId, userId)));

  if (set.length === 0) {
    return null;
  }

  const result = await db
    .update(setsTable)
    .set({
      reps: data.reps,
      weight: data.weight,
    })
    .where(eq(setsTable.id, setId))
    .returning();

  return result[0] ?? null;
}

export async function deleteSet(setId: number, userId: string) {
  // Verify ownership through sets -> workout_exercises -> workouts chain
  const set = await db
    .select({
      id: setsTable.id,
    })
    .from(setsTable)
    .innerJoin(
      workoutExercisesTable,
      eq(setsTable.workoutExerciseId, workoutExercisesTable.id)
    )
    .innerJoin(
      workoutsTable,
      eq(workoutExercisesTable.workoutId, workoutsTable.id)
    )
    .where(and(eq(setsTable.id, setId), eq(workoutsTable.userId, userId)));

  if (set.length === 0) {
    return null;
  }

  const result = await db
    .delete(setsTable)
    .where(eq(setsTable.id, setId))
    .returning();

  return result[0] ?? null;
}
