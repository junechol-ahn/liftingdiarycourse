"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSetAction, deleteSetAction } from "../actions";

type Set = {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type SetRowProps = {
  set: Set;
  workoutId: number;
};

export function SetRow({ set, workoutId }: SetRowProps) {
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [weight, setWeight] = useState(set.weight ?? "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(field: "reps" | "weight", value: string) {
    setError(null);

    const updateData: {
      setId: number;
      workoutId: number;
      reps?: number;
      weight?: string;
    } = {
      setId: set.id,
      workoutId,
    };

    if (field === "reps") {
      const repsNum = value === "" ? undefined : parseInt(value, 10);
      if (value !== "" && isNaN(repsNum!)) return;
      updateData.reps = repsNum;
      updateData.weight = weight || undefined;
    } else {
      updateData.reps = reps === "" ? undefined : parseInt(reps, 10);
      updateData.weight = value || undefined;
    }

    const result = await updateSetAction(updateData);
    if (!result.success) {
      setError(result.error);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    const result = await deleteSetAction({
      setId: set.id,
      workoutId,
    });

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
    }
  }

  return (
    <tr className="border-b border-border">
      <td className="py-2 px-3 text-center">{set.setNumber}</td>
      <td className="py-2 px-3">
        <Input
          type="number"
          min="0"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          onBlur={(e) => handleUpdate("reps", e.target.value)}
          className="w-20 text-center"
          placeholder="-"
        />
      </td>
      <td className="py-2 px-3">
        <Input
          type="text"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={(e) => handleUpdate("weight", e.target.value)}
          className="w-24 text-center"
          placeholder="-"
        />
      </td>
      <td className="py-2 px-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? "..." : "Delete"}
        </Button>
        {error && <span className="text-xs text-destructive ml-2">{error}</span>}
      </td>
    </tr>
  );
}
