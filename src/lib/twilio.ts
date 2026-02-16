import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  return twilio(accountSid, authToken);
}

/**
 * Place an outbound call that speaks the reminder message using TwiML.
 * toNumber must be E.164 format.
 */
export async function placeReminderCall(
  toNumber: string,
  eventSummary: string,
  eventStart: Date
): Promise<string | null> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) throw new Error("TWILIO_PHONE_NUMBER not set");

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const twimlUrl = `${baseUrl}/api/twilio/voice?summary=${encodeURIComponent(eventSummary)}&start=${encodeURIComponent(eventStart.toISOString())}`;

  const call = await client.calls.create({
    to: toNumber,
    from: fromNumber,
    url: twimlUrl,
    method: "GET",
    timeout: 30,
  });
  return call.sid;
}
