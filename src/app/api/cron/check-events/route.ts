import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUpcomingEvents } from "@/lib/google-calendar";
import { placeReminderCall } from "@/lib/twilio";

/**
 * Cron endpoint: every run, find users with a phone number, get their
 * calendar events in the next 5 minutes, and place a Twilio call for each
 * event we haven't already reminded (idempotent via ReminderSent).
 *
 * Security: Requires Bearer token matching CRON_SECRET.
 * Idempotency: Tracks sent reminders in the ReminderSent table to prevent
 *              duplicate calls for the same event.
 * Edge cases handled:
 *  - Users without a phone number are skipped
 *  - All-day events are filtered out at the Calendar layer
 *  - Cancelled events are filtered out at the Calendar layer
 *  - Token refresh failures are handled gracefully (returns empty events)
 *  - Individual call failures don't block other users/events
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only fetch users who have saved a phone number
  const users = await prisma.user.findMany({
    where: {
      phoneNumber: { not: null },
    },
    select: { id: true, phoneNumber: true },
  });

  if (users.length === 0) {
    console.log("[Cron] No users with phone numbers found");
    return NextResponse.json({
      ok: true,
      message: "No users with phone numbers",
      usersChecked: 0,
      totalCalls: 0,
      durationMs: Date.now() - startTime,
    });
  }

  console.log(`[Cron] Checking ${users.length} user(s) for upcoming events`);

  const results: {
    userId: string;
    eventsFound: number;
    callsPlaced: number;
    skippedDuplicate: number;
    errors: string[];
  }[] = [];

  let totalCalls = 0;

  for (const user of users) {
    const phone = user.phoneNumber!;
    const errors: string[] = [];
    let callsPlaced = 0;
    let skippedDuplicate = 0;

    try {
      const events = await getUpcomingEvents(user.id);

      for (const event of events) {
        // Idempotency check: skip if we already sent a reminder for this event
        const alreadySent = await prisma.reminderSent.findUnique({
          where: {
            userId_eventId_startAt: {
              userId: user.id,
              eventId: event.id,
              startAt: event.start,
            },
          },
        });

        if (alreadySent) {
          skippedDuplicate++;
          continue;
        }

        try {
          const callSid = await placeReminderCall(
            phone,
            event.summary,
            event.start,
            event.timeZone,
          );

          // Record the reminder to prevent duplicates on next cron run
          await prisma.reminderSent.create({
            data: {
              userId: user.id,
              eventId: event.id,
              startAt: event.start,
            },
          });

          callsPlaced++;
          totalCalls++;
          console.log(`[Cron] Reminder sent: user=${user.id}, event="${event.summary}", callSid=${callSid}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Event "${event.summary}" (${event.id}): ${msg}`);
          console.error(`[Cron] Call failed: user=${user.id}, event=${event.id}:`, err);
        }
      }

      results.push({
        userId: user.id,
        eventsFound: events.length,
        callsPlaced,
        skippedDuplicate,
        errors,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        userId: user.id,
        eventsFound: 0,
        callsPlaced: 0,
        skippedDuplicate: 0,
        errors: [msg],
      });
      console.error(`[Cron] Failed to process user ${user.id}:`, err);
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Cron] Completed in ${durationMs}ms: ${users.length} users, ${totalCalls} calls placed`);

  return NextResponse.json({
    ok: true,
    usersChecked: users.length,
    totalCalls,
    durationMs,
    results,
  });
}
