import { google } from "googleapis";
import { prisma } from "@/lib/db";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  timeZone: string;
  status: string;
  htmlLink?: string;
}

/**
 * Get a valid access token for the user, refreshing if necessary.
 * Returns null if the user has no Google account linked or tokens are invalid.
 */
async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    console.warn(`[Calendar] No access token found for user ${userId}`);
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at ?? 0;

  // Token is still valid — return it directly
  if (expiresAt > now + 300) {
    return account.access_token;
  }

  // Token expired or expiring soon — attempt refresh
  if (!account.refresh_token) {
    console.warn(`[Calendar] Token expired and no refresh_token for user ${userId}`);
    return null;
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ refresh_token: account.refresh_token });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      console.error(`[Calendar] Refresh returned no access_token for user ${userId}`);
      return null;
    }

    await prisma.account.updateMany({
      where: { userId, provider: "google" },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : null,
      },
    });

    return credentials.access_token;
  } catch (err) {
    console.error(`[Calendar] Token refresh failed for user ${userId}:`, err);
    return null;
  }
}

/**
 * Fetch calendar events that start within the next 5 minutes for the given user.
 * Automatically filters out:
 * - All-day events (no specific time)
 * - Cancelled events
 * - Events without a valid ID
 */
export async function getUpcomingEvents(userId: string): Promise<CalendarEvent[]> {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return [];

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const timeMin = new Date();
  const timeMax = new Date(Date.now() + FIVE_MINUTES_MS);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const items = res.data.items ?? [];

  return items
    .filter((e) => {
      // Skip all-day events (they use `date` instead of `dateTime`)
      if (!e.start?.dateTime) return false;
      // Skip cancelled events
      if (e.status === "cancelled") return false;
      // Skip events without a valid ID
      if (!e.id) return false;
      return true;
    })
    .map((e) => ({
      id: e.id!,
      summary: e.summary ?? "Untitled event",
      start: new Date(e.start!.dateTime!),
      end: new Date(e.end!.dateTime ?? e.start!.dateTime!),
      timeZone: e.start!.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: e.status ?? "confirmed",
      htmlLink: e.htmlLink ?? undefined,
    }));
}
