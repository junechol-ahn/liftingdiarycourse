"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateWorkoutAction } from "../actions";

type Workout = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
};

function formatDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EditWorkoutForm({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const startedAt = formData.get("startedAt") as string;
    const notes = formData.get("notes") as string;

    const result = await updateWorkoutAction({
      workoutId: workout.id,
      name,
      startedAt,
      notes: notes || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      if (result.error === "Unauthorized") {
        router.push("/sign-in");
        return;
      }
      setError(result.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Workout Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Upper Body, Leg Day"
              defaultValue={workout.name ?? ""}
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startedAt">Start Time</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(workout.startedAt)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any notes about this workout..."
              defaultValue={workout.notes ?? ""}
              maxLength={1000}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
