import { db } from "@/src/db";
import {
  workoutsTable,
  workoutExercisesTable,
  exercisesTable,
  setsTable,
} from "@/src/db/schema";
import { eq, and, max } from "drizzle-orm";

export type WorkoutExerciseWithSets = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: {
    id: number;
    setNumber: number;
    reps: number | null;
    weight: string | null;
  }[];
};

export async function getWorkoutExercisesWithSets(
  workoutId: number,
  userId: string
): Promise<WorkoutExerciseWithSets[]> {
  // First verify workout ownership
  const workout = await db
    .select()
    .from(workoutsTable)
    .where(
      and(eq(workoutsTable.id, workoutId), eq(workoutsTable.userId, userId))
    );

  if (workout.length === 0) {
    return [];
  }

  // Get workout exercises with exercise details
  const workoutExercises = await db
    .select({
      id: workoutExercisesTable.id,
      exerciseId: workoutExercisesTable.exerciseId,
      exerciseName: exercisesTable.name,
      order: workoutExercisesTable.order,
    })
    .from(workoutExercisesTable)
    .innerJoin(
      exercisesTable,
      eq(workoutExercisesTable.exerciseId, exercisesTable.id)
    )
    .where(eq(workoutExercisesTable.workoutId, workoutId))
    .orderBy(workoutExercisesTable.order);

  // Get sets for each workout exercise
  const result = await Promise.all(
    workoutExercises.map(async (we) => {
      const sets = await db
        .select({
          id: setsTable.id,
          setNumber: setsTable.setNumber,
          reps: setsTable.reps,
          weight: setsTable.weight,
        })
        .from(setsTable)
        .where(eq(setsTable.workoutExerciseId, we.id))
        .orderBy(setsTable.setNumber);

      return {
        ...we,
        sets,
      };
    })
  );

  return result;
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  userId: string
) {
  // Verify workout ownership
  const workout = await db
    .select()
    .from(workoutsTable)
    .where(
      and(eq(workoutsTable.id, workoutId), eq(workoutsTable.userId, userId))
    );

  if (workout.length === 0) {
    return null;
  }

  // Get the current max order for this workout
  const maxOrderResult = await db
    .select({ maxOrder: max(workoutExercisesTable.order) })
    .from(workoutExercisesTable)
    .where(eq(workoutExercisesTable.workoutId, workoutId));

  const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

  const result = await db
    .insert(workoutExercisesTable)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
    })
    .returning();

  return result[0];
}

export async function removeExerciseFromWorkout(
  workoutExerciseId: number,
  userId: string
) {
  // Verify ownership through workout
  const workoutExercise = await db
    .select({
      id: workoutExercisesTable.id,
      workoutId: workoutExercisesTable.workoutId,
    })
    .from(workoutExercisesTable)
    .innerJoin(
      workoutsTable,
      eq(workoutExercisesTable.workoutId, workoutsTable.id)
    )
    .where(
      and(
        eq(workoutExercisesTable.id, workoutExerciseId),
        eq(workoutsTable.userId, userId)
      )
    );

  if (workoutExercise.length === 0) {
    return null;
  }

  // Delete associated sets first
  await db
    .delete(setsTable)
    .where(eq(setsTable.workoutExerciseId, workoutExerciseId));

  // Delete the workout exercise
  const result = await db
    .delete(workoutExercisesTable)
    .where(eq(workoutExercisesTable.id, workoutExerciseId))
    .returning();

  return result[0] ?? null;
}
