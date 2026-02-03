"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";
import { createExercise, getExerciseByName } from "@/data/exercises";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
} from "@/data/workout-exercises";
import { createSet, updateSet, deleteSet } from "@/data/sets";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Workout name is required").max(255),
  startedAt: z.coerce.date({ message: "Start time is required" }),
  notes: z.string().max(1000).optional(),
});

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateWorkoutAction(data: {
  workoutId: number;
  name: string;
  startedAt: string;
  notes?: string;
}): Promise<ActionResult<{ id: number }>> {
  const result = updateWorkoutSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workout = await updateWorkout(result.data.workoutId, userId, {
      name: result.data.name,
      startedAt: result.data.startedAt,
      notes: result.data.notes,
    });

    if (!workout) {
      return { success: false, error: "Workout not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: "Failed to update workout" };
  }
}

// Exercise actions
const addExerciseToWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(data: {
  workoutId: number;
  exerciseId: number;
}): Promise<ActionResult<{ id: number }>> {
  const result = addExerciseToWorkoutSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workoutExercise = await addExerciseToWorkout(
      result.data.workoutId,
      result.data.exerciseId,
      userId
    );

    if (!workoutExercise) {
      return { success: false, error: "Workout not found" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: { id: workoutExercise.id } };
  } catch {
    return { success: false, error: "Failed to add exercise to workout" };
  }
}

const addNewExerciseToWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1, "Exercise name is required").max(255),
});

export async function addNewExerciseToWorkoutAction(data: {
  workoutId: number;
  exerciseName: string;
}): Promise<ActionResult<{ id: number }>> {
  const result = addNewExerciseToWorkoutSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if exercise already exists
    let exercise = await getExerciseByName(result.data.exerciseName);

    // Create if it doesn't exist
    if (!exercise) {
      exercise = await createExercise({ name: result.data.exerciseName });
    }

    if (!exercise) {
      return { success: false, error: "Failed to create exercise" };
    }

    // Add to workout
    const workoutExercise = await addExerciseToWorkout(
      result.data.workoutId,
      exercise.id,
      userId
    );

    if (!workoutExercise) {
      return { success: false, error: "Workout not found" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: { id: workoutExercise.id } };
  } catch {
    return { success: false, error: "Failed to add exercise to workout" };
  }
}

const removeExerciseFromWorkoutSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(data: {
  workoutExerciseId: number;
  workoutId: number;
}): Promise<ActionResult<null>> {
  const result = removeExerciseFromWorkoutSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const removed = await removeExerciseFromWorkout(
      result.data.workoutExerciseId,
      userId
    );

    if (!removed) {
      return { success: false, error: "Exercise not found in workout" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to remove exercise from workout" };
  }
}

// Set actions
const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  reps: z.number().int().min(0).optional(),
  weight: z.string().optional(),
});

export async function addSetAction(data: {
  workoutExerciseId: number;
  workoutId: number;
  reps?: number;
  weight?: string;
}): Promise<ActionResult<{ id: number }>> {
  const result = addSetSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const set = await createSet(
      {
        workoutExerciseId: result.data.workoutExerciseId,
        reps: result.data.reps,
        weight: result.data.weight,
      },
      userId
    );

    if (!set) {
      return { success: false, error: "Exercise not found in workout" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: { id: set.id } };
  } catch {
    return { success: false, error: "Failed to add set" };
  }
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
  reps: z.number().int().min(0).optional(),
  weight: z.string().optional(),
});

export async function updateSetAction(data: {
  setId: number;
  workoutId: number;
  reps?: number;
  weight?: string;
}): Promise<ActionResult<{ id: number }>> {
  const result = updateSetSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const set = await updateSet(
      result.data.setId,
      {
        reps: result.data.reps,
        weight: result.data.weight,
      },
      userId
    );

    if (!set) {
      return { success: false, error: "Set not found" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: { id: set.id } };
  } catch {
    return { success: false, error: "Failed to update set" };
  }
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(),
});

export async function deleteSetAction(data: {
  setId: number;
  workoutId: number;
}): Promise<ActionResult<null>> {
  const result = deleteSetSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteSet(result.data.setId, userId);

    if (!deleted) {
      return { success: false, error: "Set not found" };
    }

    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete set" };
  }
}
