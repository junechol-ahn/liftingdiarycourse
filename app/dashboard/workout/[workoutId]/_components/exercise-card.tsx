"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { AddSetButton } from "./add-set-button";
import { removeExerciseFromWorkoutAction } from "../actions";

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

type ExerciseCardProps = {
  workoutExercise: WorkoutExercise;
  workoutId: number;
};

export function ExerciseCard({ workoutExercise, workoutId }: ExerciseCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setIsRemoving(true);
    setError(null);

    const result = await removeExerciseFromWorkoutAction({
      workoutExerciseId: workoutExercise.id,
      workoutId,
    });

    if (!result.success) {
      setError(result.error);
      setIsRemoving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workoutExercise.exerciseName}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardHeader>
      <CardContent>
        {workoutExercise.sets.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="py-2 px-3 text-center font-medium">Set</th>
                <th className="py-2 px-3 text-left font-medium">Reps</th>
                <th className="py-2 px-3 text-left font-medium">Weight</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {workoutExercise.sets.map((set) => (
                <SetRow key={set.id} set={set} workoutId={workoutId} />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">No sets recorded yet.</p>
        )}
        <div className="mt-4">
          <AddSetButton
            workoutExerciseId={workoutExercise.id}
            workoutId={workoutId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
