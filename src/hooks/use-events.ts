"use client";

import { useQuery } from "@tanstack/react-query";
import { getUpcomingEvents } from "@/lib/api/services";

/** Query keys for calendar events. */
export const eventKeys = {
  all: ["events"] as const,
  upcoming: ["events", "upcoming"] as const,
};

/**
 * Fetch upcoming calendar events (next 5 minutes).
 * - `enabled: false` so it only runs when manually triggered via `refetch()`.
 */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: eventKeys.upcoming,
    queryFn: getUpcomingEvents,
    enabled: false,
  });
}
