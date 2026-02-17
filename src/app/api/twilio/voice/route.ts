import { NextRequest } from "next/server";

/**
 * Twilio webhook: returns TwiML to speak the calendar reminder.
 * This endpoint is kept as a fallback — the primary flow uses inline TwiML
 * passed directly via the Twilio API (see src/lib/twilio.ts).
 *
 * Supports both GET and POST since Twilio may use either method.
 */
function buildTwiml(request: NextRequest): Response {
  const searchParams = request.nextUrl.searchParams;
  const summary = searchParams.get("summary") ?? "Your calendar event";
  const startParam = searchParams.get("start");
  const tz = searchParams.get("tz") ?? "UTC";

  let startTime = "soon";
  if (startParam) {
    try {
      startTime = new Date(startParam).toLocaleString("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      startTime = new Date(startParam).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const message = `Reminder: You have an upcoming event: ${escapeXml(summary)}, starting at ${escapeXml(startTime)}.`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${message}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="en-US">Goodbye.</Say>
  <Hangup/>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "application/xml" },
  });
}

export async function GET(request: NextRequest) {
  return buildTwiml(request);
}

export async function POST(request: NextRequest) {
  return buildTwiml(request);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
