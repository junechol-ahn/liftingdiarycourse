"use client";

import { ExerciseCard } from "./exercise-card";
import { AddExerciseDialog } from "./add-exercise-dialog";

type Set = {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type WorkoutExercise = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: Set[];
};

type Exercise = {
  id: number;
  name: string;
};

type ExerciseListProps = {
  workoutExercises: WorkoutExercise[];
  allExercises: Exercise[];
  workoutId: number;
};

export function ExerciseList({
  workoutExercises,
  allExercises,
  workoutId,
}: ExerciseListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Exercises</h2>
        <AddExerciseDialog workoutId={workoutId} exercises={allExercises} />
      </div>

      {workoutExercises.length === 0 ? (
        <p className="text-muted-foreground">
          No exercises added yet. Click &quot;Add Exercise&quot; to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {workoutExercises.map((workoutExercise) => (
            <ExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              workoutId={workoutId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
