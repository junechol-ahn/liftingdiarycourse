import { db } from "@/src/db";
import { exercisesTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function getAllExercises() {
  return db.select().from(exercisesTable).orderBy(exercisesTable.name);
}

export async function getExerciseByName(name: string) {
  const result = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.name, name));
  return result[0] ?? null;
}

export async function createExercise(data: { name: string }) {
  const result = await db
    .insert(exercisesTable)
    .values({ name: data.name })
    .returning();
  return result[0];
}
