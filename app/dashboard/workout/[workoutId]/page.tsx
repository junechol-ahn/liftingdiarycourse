import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { getWorkoutExercisesWithSets } from "@/data/workout-exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { ExerciseList } from "./_components/exercise-list";

type Params = Promise<{ workoutId: string }>;

export default async function EditWorkoutPage({ params }: { params: Params }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    notFound();
  }

  const [workout, workoutExercises, allExercises] = await Promise.all([
    getWorkoutById(workoutIdNum, userId),
    getWorkoutExercisesWithSets(workoutIdNum, userId),
    getAllExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Workout</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <EditWorkoutForm workout={workout} />
        <ExerciseList
          workoutExercises={workoutExercises}
          allExercises={allExercises}
          workoutId={workoutIdNum}
        />
      </div>
    </main>
  );
}
