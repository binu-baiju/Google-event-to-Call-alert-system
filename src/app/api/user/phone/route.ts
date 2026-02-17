import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { isValidE164, normalizePhone } from "@/lib/utils";
import { getUserPhone, updateUserPhone } from "@/lib/queries/user";

const bodySchema = z.object({
  phoneNumber: z.string().min(10).max(20),
});

/** PUT: Set or update the current user's phone number (E.164). */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid phone number", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const normalized = normalizePhone(parsed.data.phoneNumber);
  if (!isValidE164(normalized)) {
    return NextResponse.json(
      { error: "Phone number must be in E.164 format (e.g. +1234567890)" },
      { status: 400 },
    );
  }

  await updateUserPhone(session.user.id, normalized);
  return NextResponse.json({ phoneNumber: normalized });
}

/** GET: Return the current user's phone number if set. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const phoneNumber = await getUserPhone(session.user.id);
  return NextResponse.json({ phoneNumber });
}
