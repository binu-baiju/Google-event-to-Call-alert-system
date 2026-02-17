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
 * Place an outbound call that speaks the reminder message using inline TwiML.
 * toNumber must be E.164 format.
 */
export async function placeReminderCall(
  toNumber: string,
  eventSummary: string,
  eventStart: Date,
): Promise<string | null> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) throw new Error("TWILIO_PHONE_NUMBER not set");

  const startTime = eventStart.toLocaleString();
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
  return call.sid;
}
