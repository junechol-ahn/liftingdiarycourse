import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutsByUserIdAndDate } from "@/data/workouts";
import { DashboardCalendar } from "./_components/dashboard-calendar";
import { WorkoutList } from "./_components/workout-list";

type DashboardPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();
  const workouts = await getWorkoutsByUserIdAndDate(userId, selectedDate);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workout Dashboard</h1>

      <div className="space-y-6">
        <Suspense fallback={<div>Loading calendar...</div>}>
          <DashboardCalendar />
        </Suspense>

        <WorkoutList workouts={workouts} />
      </div>
    </main>
  );
}
