import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET: Return recent reminder history for the current user.
 * Shows the last 20 reminders, most recent first.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reminders = await prisma.reminderSent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        eventId: true,
        startAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      reminders: reminders.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        eventStartAt: r.startAt.toISOString(),
        calledAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[Reminders] History fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reminder history" },
      { status: 500 },
    );
  }
}
