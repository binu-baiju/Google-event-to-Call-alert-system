import { prisma } from "@/lib/db";

/** Check if a reminder was already sent for a specific event. */
export async function hasReminderBeenSent(
  userId: string,
  eventId: string,
  startAt: Date,
) {
  const existing = await prisma.reminderSent.findUnique({
    where: {
      userId_eventId_startAt: { userId, eventId, startAt },
    },
  });
  return !!existing;
}

/** Record that a reminder was sent. */
export async function createReminderRecord(
  userId: string,
  eventId: string,
  startAt: Date,
) {
  await prisma.reminderSent.create({
    data: { userId, eventId, startAt },
  });
}

/** Get recent reminders for a user (last N, newest first). */
export async function getRecentReminders(userId: string, limit = 20) {
  const reminders = await prisma.reminderSent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      eventId: true,
      startAt: true,
      createdAt: true,
    },
  });

  return reminders.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    eventStartAt: r.startAt.toISOString(),
    calledAt: r.createdAt.toISOString(),
  }));
}
