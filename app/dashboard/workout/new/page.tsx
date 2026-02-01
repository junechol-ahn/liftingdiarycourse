import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateWorkoutForm } from "./_components/create-workout-form";

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Workout</h1>
      <CreateWorkoutForm />
    </main>
  );
}
