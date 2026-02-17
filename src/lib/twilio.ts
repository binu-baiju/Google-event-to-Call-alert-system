import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  return twilio(accountSid, authToken);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Format event start time for the voice message.
 * Uses the event's own timezone from Google Calendar (e.g. "Asia/Kolkata")
 * so the spoken time matches what the user sees in their calendar.
 */
function formatEventTime(eventStart: Date, timeZone: string): string {
  try {
    return eventStart.toLocaleString("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    // Fallback if timezone is invalid
    return eventStart.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

/**
 * Place an outbound call that speaks the reminder message using inline TwiML.
 * @param toNumber - E.164 formatted phone number
 * @param eventSummary - Event title from Google Calendar
 * @param eventStart - Event start time
 * @param timeZone - Event timezone from Google Calendar (e.g. "Asia/Kolkata")
 * @returns Twilio Call SID or null
 */
export async function placeReminderCall(
  toNumber: string,
  eventSummary: string,
  eventStart: Date,
  timeZone: string,
): Promise<string | null> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) throw new Error("TWILIO_PHONE_NUMBER not set");

  const startTime = formatEventTime(eventStart, timeZone);
  const message = `Reminder: You have an upcoming event: ${escapeXml(eventSummary)}, starting at ${escapeXml(startTime)}.`;

  const twimlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${message}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="en-US">Goodbye.</Say>
  <Hangup/>
</Response>`;

  const call = await client.calls.create({
    to: toNumber,
    from: fromNumber,
    twiml: twimlContent,
    timeout: 30,
  });

  console.log(`[Twilio] Call placed to ${toNumber} for event "${eventSummary}" (SID: ${call.sid})`);
  return call.sid;
}
