import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  exercisesTable,
  workoutsTable,
  workoutExercisesTable,
  setsTable,
} from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log("Seeding database...");

  // Insert exercises
  const exercises = await db
    .insert(exercisesTable)
    .values([
      { name: "Bench Press" },
      { name: "Squat" },
      { name: "Deadlift" },
      { name: "Overhead Press" },
      { name: "Barbell Row" },
      { name: "Pull-up" },
      { name: "Dumbbell Curl" },
      { name: "Tricep Pushdown" },
      { name: "Leg Press" },
      { name: "Romanian Deadlift" },
    ])
    .returning();

  console.log(`Inserted ${exercises.length} exercises`);

  // Create a map for easy lookup
  const exerciseMap = Object.fromEntries(
    exercises.map((e) => [e.name, e.id])
  );

  // Insert workouts
  const workouts = await db
    .insert(workoutsTable)
    .values([
      {
        userId: "user_demo_1",
        name: "Push Day",
        startedAt: new Date("2025-01-27T09:00:00"),
        completedAt: new Date("2025-01-27T10:15:00"),
        notes: "Felt strong today, increased bench weight",
      },
      {
        userId: "user_demo_1",
        name: "Pull Day",
        startedAt: new Date("2025-01-28T09:00:00"),
        completedAt: new Date("2025-01-28T10:30:00"),
        notes: "Good back pump",
      },
      {
        userId: "user_demo_1",
        name: "Leg Day",
        startedAt: new Date("2025-01-29T18:00:00"),
        completedAt: new Date("2025-01-29T19:20:00"),
        notes: "Heavy squats, legs are shaking",
      },
      {
        userId: "user_demo_2",
        name: "Full Body",
        startedAt: new Date("2025-01-30T07:00:00"),
        completedAt: new Date("2025-01-30T08:00:00"),
        notes: null,
      },
    ])
    .returning();

  console.log(`Inserted ${workouts.length} workouts`);

  // Insert workout exercises
  const workoutExercises = await db
    .insert(workoutExercisesTable)
    .values([
      // Push Day exercises
      { workoutId: workouts[0].id, exerciseId: exerciseMap["Bench Press"], order: 1 },
      { workoutId: workouts[0].id, exerciseId: exerciseMap["Overhead Press"], order: 2 },
      { workoutId: workouts[0].id, exerciseId: exerciseMap["Tricep Pushdown"], order: 3 },
      // Pull Day exercises
      { workoutId: workouts[1].id, exerciseId: exerciseMap["Deadlift"], order: 1 },
      { workoutId: workouts[1].id, exerciseId: exerciseMap["Barbell Row"], order: 2 },
      { workoutId: workouts[1].id, exerciseId: exerciseMap["Pull-up"], order: 3 },
      { workoutId: workouts[1].id, exerciseId: exerciseMap["Dumbbell Curl"], order: 4 },
      // Leg Day exercises
      { workoutId: workouts[2].id, exerciseId: exerciseMap["Squat"], order: 1 },
      { workoutId: workouts[2].id, exerciseId: exerciseMap["Leg Press"], order: 2 },
      { workoutId: workouts[2].id, exerciseId: exerciseMap["Romanian Deadlift"], order: 3 },
      // Full Body exercises
      { workoutId: workouts[3].id, exerciseId: exerciseMap["Bench Press"], order: 1 },
      { workoutId: workouts[3].id, exerciseId: exerciseMap["Squat"], order: 2 },
      { workoutId: workouts[3].id, exerciseId: exerciseMap["Barbell Row"], order: 3 },
    ])
    .returning();

  console.log(`Inserted ${workoutExercises.length} workout exercises`);

  // Insert sets
  const sets = await db
    .insert(setsTable)
    .values([
      // Bench Press sets (Push Day)
      { workoutExerciseId: workoutExercises[0].id, setNumber: 1, reps: 10, weight: "60.00" },
      { workoutExerciseId: workoutExercises[0].id, setNumber: 2, reps: 8, weight: "70.00" },
      { workoutExerciseId: workoutExercises[0].id, setNumber: 3, reps: 6, weight: "80.00" },
      { workoutExerciseId: workoutExercises[0].id, setNumber: 4, reps: 6, weight: "80.00" },
      // Overhead Press sets
      { workoutExerciseId: workoutExercises[1].id, setNumber: 1, reps: 10, weight: "30.00" },
      { workoutExerciseId: workoutExercises[1].id, setNumber: 2, reps: 8, weight: "35.00" },
      { workoutExerciseId: workoutExercises[1].id, setNumber: 3, reps: 8, weight: "35.00" },
      // Tricep Pushdown sets
      { workoutExerciseId: workoutExercises[2].id, setNumber: 1, reps: 12, weight: "20.00" },
      { workoutExerciseId: workoutExercises[2].id, setNumber: 2, reps: 12, weight: "20.00" },
      { workoutExerciseId: workoutExercises[2].id, setNumber: 3, reps: 10, weight: "22.50" },
      // Deadlift sets (Pull Day)
      { workoutExerciseId: workoutExercises[3].id, setNumber: 1, reps: 5, weight: "100.00" },
      { workoutExerciseId: workoutExercises[3].id, setNumber: 2, reps: 5, weight: "120.00" },
      { workoutExerciseId: workoutExercises[3].id, setNumber: 3, reps: 3, weight: "140.00" },
      // Barbell Row sets
      { workoutExerciseId: workoutExercises[4].id, setNumber: 1, reps: 10, weight: "50.00" },
      { workoutExerciseId: workoutExercises[4].id, setNumber: 2, reps: 8, weight: "60.00" },
      { workoutExerciseId: workoutExercises[4].id, setNumber: 3, reps: 8, weight: "60.00" },
      // Pull-up sets
      { workoutExerciseId: workoutExercises[5].id, setNumber: 1, reps: 10, weight: "0.00" },
      { workoutExerciseId: workoutExercises[5].id, setNumber: 2, reps: 8, weight: "0.00" },
      { workoutExerciseId: workoutExercises[5].id, setNumber: 3, reps: 6, weight: "0.00" },
      // Dumbbell Curl sets
      { workoutExerciseId: workoutExercises[6].id, setNumber: 1, reps: 12, weight: "12.00" },
      { workoutExerciseId: workoutExercises[6].id, setNumber: 2, reps: 10, weight: "14.00" },
      { workoutExerciseId: workoutExercises[6].id, setNumber: 3, reps: 10, weight: "14.00" },
      // Squat sets (Leg Day)
      { workoutExerciseId: workoutExercises[7].id, setNumber: 1, reps: 8, weight: "80.00" },
      { workoutExerciseId: workoutExercises[7].id, setNumber: 2, reps: 6, weight: "100.00" },
      { workoutExerciseId: workoutExercises[7].id, setNumber: 3, reps: 5, weight: "110.00" },
      { workoutExerciseId: workoutExercises[7].id, setNumber: 4, reps: 5, weight: "110.00" },
      // Leg Press sets
      { workoutExerciseId: workoutExercises[8].id, setNumber: 1, reps: 12, weight: "150.00" },
      { workoutExerciseId: workoutExercises[8].id, setNumber: 2, reps: 10, weight: "180.00" },
      { workoutExerciseId: workoutExercises[8].id, setNumber: 3, reps: 10, weight: "180.00" },
      // Romanian Deadlift sets
      { workoutExerciseId: workoutExercises[9].id, setNumber: 1, reps: 10, weight: "60.00" },
      { workoutExerciseId: workoutExercises[9].id, setNumber: 2, reps: 10, weight: "70.00" },
      { workoutExerciseId: workoutExercises[9].id, setNumber: 3, reps: 8, weight: "70.00" },
      // Bench Press sets (Full Body)
      { workoutExerciseId: workoutExercises[10].id, setNumber: 1, reps: 8, weight: "60.00" },
      { workoutExerciseId: workoutExercises[10].id, setNumber: 2, reps: 8, weight: "65.00" },
      { workoutExerciseId: workoutExercises[10].id, setNumber: 3, reps: 8, weight: "65.00" },
      // Squat sets (Full Body)
      { workoutExerciseId: workoutExercises[11].id, setNumber: 1, reps: 8, weight: "70.00" },
      { workoutExerciseId: workoutExercises[11].id, setNumber: 2, reps: 8, weight: "80.00" },
      { workoutExerciseId: workoutExercises[11].id, setNumber: 3, reps: 8, weight: "80.00" },
      // Barbell Row sets (Full Body)
      { workoutExerciseId: workoutExercises[12].id, setNumber: 1, reps: 8, weight: "50.00" },
      { workoutExerciseId: workoutExercises[12].id, setNumber: 2, reps: 8, weight: "55.00" },
      { workoutExerciseId: workoutExercises[12].id, setNumber: 3, reps: 8, weight: "55.00" },
    ])
    .returning();

  console.log(`Inserted ${sets.length} sets`);

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
