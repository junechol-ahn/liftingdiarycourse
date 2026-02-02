"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type WorkoutWithExercises } from "@/data/workouts";

type WorkoutListProps = {
  workouts: WorkoutWithExercises[];
};

export function WorkoutList({ workouts }: WorkoutListProps) {
  const router = useRouter();

  if (workouts.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">No workouts logged for this day.</p>
        <Button onClick={() => router.push("/dashboard/workout/new")}>
          Add Workout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => router.push("/dashboard/workout/new")}>
        Add Workout
      </Button>
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center">
              <span>{workout.name || "Untitled Workout"}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {format(workout.startedAt, "h:mm a")}
                {workout.completedAt && (
                  <> - {format(workout.completedAt, "h:mm a")}</>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workout.notes && (
              <p className="text-muted-foreground mb-3 italic">
                {workout.notes}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {workout.exercises.map((exercise) => (
                <Badge key={exercise.id} variant="secondary">
                  {exercise.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
