"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addExerciseToWorkoutAction,
  addNewExerciseToWorkoutAction,
} from "../actions";

type Exercise = {
  id: number;
  name: string;
};

type AddExerciseDialogProps = {
  workoutId: number;
  exercises: Exercise[];
};

export function AddExerciseDialog({ workoutId, exercises }: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = exercises.find(
    (exercise) => exercise.name.toLowerCase() === search.toLowerCase()
  );

  async function handleSelectExercise(exerciseId: number) {
    setIsAdding(true);
    setError(null);

    const result = await addExerciseToWorkoutAction({
      workoutId,
      exerciseId,
    });

    setIsAdding(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setSearch("");
  }

  async function handleCreateAndAdd() {
    if (!search.trim()) return;

    setIsAdding(true);
    setError(null);

    const result = await addNewExerciseToWorkoutAction({
      workoutId,
      exerciseName: search.trim(),
    });

    setIsAdding(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Exercise</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-search">Search or create exercise</Label>
            <Input
              id="exercise-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g., Bench Press, Squat..."
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {search && !exactMatch && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCreateAndAdd}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : `Create "${search.trim()}"`}
            </Button>
          )}

          {filteredExercises.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleSelectExercise(exercise.id)}
                  disabled={isAdding}
                >
                  {exercise.name}
                </Button>
              ))}
            </div>
          )}

          {search && filteredExercises.length === 0 && exactMatch === undefined && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No matching exercises found. Click above to create a new one.
            </p>
          )}

          {!search && exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exercises in catalog. Type a name to create one.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
