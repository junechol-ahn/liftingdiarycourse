"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required").max(255),
  startedAt: z.coerce.date({ message: "Start time is required" }),
  notes: z.string().max(1000).optional(),
});

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createWorkoutAction(data: {
  name: string;
  startedAt: string;
  notes?: string;
}): Promise<ActionResult<{ id: number }>> {
  const result = createWorkoutSchema.safeParse(data);
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
    const workout = await createWorkout({
      userId,
      name: result.data.name,
      startedAt: result.data.startedAt,
      notes: result.data.notes,
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: workout.id } };
  } catch {
    return { success: false, error: "Failed to create workout" };
  }
}
