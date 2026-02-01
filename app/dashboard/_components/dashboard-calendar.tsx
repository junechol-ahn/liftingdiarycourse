"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DashboardCalendar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const selectedDate = dateParam ? parseLocalDate(dateParam) : new Date();

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;

    const params = new URLSearchParams(searchParams);
    params.set("date", formatLocalDate(newDate));
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <Card>
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
        />
      </CardContent>
    </Card>
  );
}
