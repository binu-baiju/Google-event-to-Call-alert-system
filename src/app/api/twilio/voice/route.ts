import { NextRequest } from "next/server";

/**
 * Twilio webhook: returns TwiML to speak the calendar reminder.
 * Twilio calls this URL when the outbound call is answered.
 */
function buildTwiml(request: NextRequest): Response {
  const searchParams = request.nextUrl.searchParams;
  const summary = searchParams.get("summary") ?? "Your calendar event";
  const startParam = searchParams.get("start");
  const startTime = startParam ? new Date(startParam).toLocaleString() : "soon";

  const message = `Reminder: You have an upcoming event: ${summary}, starting at ${startTime}.`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${escapeXml(message)}</Say>
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
