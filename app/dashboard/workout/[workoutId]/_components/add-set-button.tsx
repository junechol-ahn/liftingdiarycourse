"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addSetAction } from "../actions";

type AddSetButtonProps = {
  workoutExerciseId: number;
  workoutId: number;
};

export function AddSetButton({ workoutExerciseId, workoutId }: AddSetButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddSet() {
    setIsAdding(true);
    setError(null);

    const result = await addSetAction({
      workoutExerciseId,
      workoutId,
    });

    setIsAdding(false);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddSet}
        disabled={isAdding}
      >
        {isAdding ? "Adding..." : "Add Set"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
