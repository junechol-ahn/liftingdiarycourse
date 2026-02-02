"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

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
