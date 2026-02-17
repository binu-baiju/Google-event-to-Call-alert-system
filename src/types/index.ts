/** Calendar event returned from /api/calendar/events */
export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  timeZone?: string;
  htmlLink?: string;
}

/** Reminder record returned from /api/reminders/history */
export interface ReminderRecord {
  id: string;
  eventId: string;
  eventStartAt: string;
  calledAt: string;
}

/** Phone number API response */
export interface PhoneResponse {
  phoneNumber: string | null;
}

/** Calendar events API response */
export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

/** Reminder history API response */
export interface ReminderHistoryResponse {
  reminders: ReminderRecord[];
}

/** Generic API error response */
export interface ApiError {
  error: string;
  details?: unknown;
}
