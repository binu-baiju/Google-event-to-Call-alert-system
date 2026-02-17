import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getRecentReminders } from "@/lib/queries/reminder";

/** GET: Return recent reminder history for the current user. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reminders = await getRecentReminders(session.user.id);
    return NextResponse.json({ reminders });
  } catch (err) {
    console.error("[Reminders] History fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reminder history" },
      { status: 500 },
    );
  }
}
