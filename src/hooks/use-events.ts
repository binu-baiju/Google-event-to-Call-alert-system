"use client";

import { useQuery } from "@tanstack/react-query";
import { getUpcomingEvents } from "@/lib/api/services";

/** Query keys for calendar events. */
export const eventKeys = {
  all: ["events"] as const,
  upcoming: ["events", "upcoming"] as const,
};

/** Stale time for upcoming events (1 min) so refetch isn't too frequent. */
const UPCOMING_STALE_MS = 60 * 1000;

/**
 * Fetch upcoming calendar events (next 5 minutes).
 * Fetches on mount and when manually refetched; cached for 1 minute.
 */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: eventKeys.upcoming,
    queryFn: getUpcomingEvents,
    staleTime: UPCOMING_STALE_MS,
  });
}
