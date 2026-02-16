import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUpcomingEvents } from "@/lib/google-calendar";
import { placeReminderCall } from "@/lib/twilio";

/**
 * Cron endpoint: every run, find users with a phone number, get their
 * calendar events in the next 5 minutes, and place a Twilio call for each
 * event we haven't already reminded (idempotent via ReminderSent).
 * Secured by CRON_SECRET (Vercel Cron sends this header).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      phoneNumber: { not: null },
    },
    select: { id: true, phoneNumber: true },
  });

  const results: { userId: string; events: number; calls: number; errors: string[] }[] = [];

  for (const user of users) {
    const phone = user.phoneNumber!;
    const errors: string[] = [];
    let callsPlaced = 0;

    try {
      const events = await getUpcomingEvents(user.id);
      for (const event of events) {
        const existing = await prisma.reminderSent.findUnique({
          where: {
            userId_eventId_startAt: {
              userId: user.id,
              eventId: event.id,
              startAt: event.start,
            },
          },
        });
        if (existing) continue;

        try {
          await placeReminderCall(phone, event.summary, event.start);
          await prisma.reminderSent.create({
            data: {
              userId: user.id,
              eventId: event.id,
              startAt: event.start,
            },
          });
          callsPlaced++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Event ${event.id}: ${msg}`);
        }
      }
      results.push({ userId: user.id, events: events.length, calls: callsPlaced, errors });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ userId: user.id, events: 0, calls: 0, errors: [msg] });
    }
  }

  return NextResponse.json({ ok: true, results });
}
