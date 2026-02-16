import { google } from "googleapis";
import { prisma } from "@/lib/db";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  htmlLink?: string;
}

/**
 * Get a valid access token for the user, refreshing if necessary.
 */
async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.access_token) return null;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at ?? 0;
  // Refresh if token expires in the next 5 minutes
  if (account.refresh_token && expiresAt && expiresAt < now + 300) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (credentials.access_token) {
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
    }
  }

  return account.access_token;
}

/**
 * Fetch calendar events that start within the next 5 minutes for the given user.
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
    .filter((e) => e.start?.dateTime)
    .map((e) => ({
      id: e.id!,
      summary: e.summary ?? "Calendar event",
      start: new Date(e.start!.dateTime!),
      end: new Date(e.end!.dateTime ?? e.start!.dateTime!),
      htmlLink: e.htmlLink ?? undefined,
    }));
}
