"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: 1,
    name: "Push Day",
    startedAt: new Date(),
    completedAt: new Date(),
    notes: "Felt strong today",
    exercises: [
      { id: 1, name: "Bench Press" },
      { id: 2, name: "Overhead Press" },
    ],
  },
  {
    id: 2,
    name: "Pull Day",
    startedAt: new Date(),
    completedAt: null,
    notes: null,
    exercises: [{ id: 3, name: "Barbell Row" }],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(() => new Date());

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workout Dashboard</h1>

      <div className="flex gap-6">
        {/* Left Pane - Calendar */}
        <div className="shrink-0">
          <Card>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - Workout Summary */}
        <div className="flex-1">
          {mockWorkouts.length === 0 ? (
            <p className="text-muted-foreground">
              No workouts logged for this day.
            </p>
          ) : (
            <div className="space-y-4">
              {mockWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between items-center">
                      <span>{workout.name || "Untitled Workout"}</span>
                      <span
                        className="text-sm font-normal text-muted-foreground"
                        suppressHydrationWarning
                      >
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
          )}
        </div>
      </div>
    </main>
  );
}
