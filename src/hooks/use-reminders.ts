"use client";

import { useQuery } from "@tanstack/react-query";
import { getReminderHistory } from "@/lib/api/services";

/** Query keys for reminder history. */
export const reminderKeys = {
  all: ["reminders"] as const,
  history: ["reminders", "history"] as const,
};

/**
 * Fetch reminder call history.
 * Auto-fetches on mount and refetches every 60 seconds.
 */
export function useReminderHistory() {
  return useQuery({
    queryKey: reminderKeys.history,
    queryFn: getReminderHistory,
    refetchInterval: 60_000,
  });
}
