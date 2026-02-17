import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getUpcomingEvents } from "@/lib/google-calendar";

/**
 * GET: Return upcoming calendar events (next 5 minutes) for the current user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await getUpcomingEvents(session.user.id);
    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        summary: e.summary,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        timeZone: e.timeZone,
        htmlLink: e.htmlLink,
      })),
    });
  } catch (err) {
    console.error("Calendar events error:", err);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
