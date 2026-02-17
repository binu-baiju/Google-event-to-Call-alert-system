import apiClient from "./client";
import type {
  PhoneResponse,
  CalendarEventsResponse,
  ReminderHistoryResponse,
} from "@/types";

// ── Phone ──────────────────────────────────────────────────────────────

/** Fetch the current user's saved phone number. */
export async function getPhone(): Promise<PhoneResponse> {
  const { data } = await apiClient.get<PhoneResponse>("/user/phone");
  return data;
}

/** Update the current user's phone number. */
export async function updatePhone(
  phoneNumber: string,
): Promise<PhoneResponse> {
  const { data } = await apiClient.put<PhoneResponse>("/user/phone", {
    phoneNumber,
  });
  return data;
}

// ── Calendar Events ────────────────────────────────────────────────────

/** Fetch upcoming calendar events (next 5 minutes). */
export async function getUpcomingEvents(): Promise<CalendarEventsResponse> {
  const { data } = await apiClient.get<CalendarEventsResponse>(
    "/calendar/events",
  );
  return data;
}

// ── Reminder History ───────────────────────────────────────────────────

/** Fetch recent call reminder history. */
export async function getReminderHistory(): Promise<ReminderHistoryResponse> {
  const { data } = await apiClient.get<ReminderHistoryResponse>(
    "/reminders/history",
  );
  return data;
}
