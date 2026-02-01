import { db } from "@/src/db";
import {
  workoutsTable,
  workoutExercisesTable,
  exercisesTable,
} from "@/src/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function createWorkout(data: {
  userId: string;
  name: string;
  startedAt: Date;
  notes?: string;
}) {
  const result = await db
    .insert(workoutsTable)
    .values({
      userId: data.userId,
      name: data.name,
      startedAt: data.startedAt,
      notes: data.notes,
    })
    .returning();
  return result[0];
}

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  exercises: {
    id: number;
    name: string;
  }[];
};

export async function getWorkoutsByUserIdAndDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const workouts = await db
    .select({
      id: workoutsTable.id,
      name: workoutsTable.name,
      startedAt: workoutsTable.startedAt,
      completedAt: workoutsTable.completedAt,
      notes: workoutsTable.notes,
    })
    .from(workoutsTable)
    .where(
      and(
        eq(workoutsTable.userId, userId),
        gte(workoutsTable.startedAt, startOfDay),
        lt(workoutsTable.startedAt, endOfDay)
      )
    );

  const workoutsWithExercises = await Promise.all(
    workouts.map(async (workout) => {
      const exercises = await db
        .select({
          id: exercisesTable.id,
          name: exercisesTable.name,
        })
        .from(workoutExercisesTable)
        .innerJoin(
          exercisesTable,
          eq(workoutExercisesTable.exerciseId, exercisesTable.id)
        )
        .where(eq(workoutExercisesTable.workoutId, workout.id))
        .orderBy(workoutExercisesTable.order);

      return {
        ...workout,
        exercises,
      };
    })
  );

  return workoutsWithExercises;
}
