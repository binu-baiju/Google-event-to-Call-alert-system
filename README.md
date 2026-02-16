# Google Calendar → Call Reminders

A web app that lets users sign in with Google, grant access to Google Calendar, and receive **automated phone call reminders** (via Twilio) for events starting in the next 5 minutes.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components
- **Backend:** Next.js API routes (Node.js + TypeScript)
- **Auth:** NextAuth.js with Google OAuth + Calendar scope
- **Database:** Prisma + SQLite (dev) / PostgreSQL (production-ready)
- **Cron:** Vercel Cron (or any scheduler calling the secured cron endpoint)
- **Calls:** Twilio API

## Features

- Google OAuth login with Calendar read access
- Store and refresh Google tokens (refresh token flow)
- User can set a phone number (E.164) for call reminders
- Cron job runs every 5 minutes: for each user with a phone number, fetches events in the next 5 minutes and places a Twilio call per event (idempotent: no duplicate calls for the same event)
- Twilio speaks the event title and start time using TwiML

## Prerequisites

- Node.js 18+
- [Google Cloud Console](https://console.cloud.google.com/): OAuth 2.0 Client (Web), with Calendar API enabled
- [Twilio](https://www.twilio.com/) account: Account SID, Auth Token, and a Twilio phone number for outbound calls

## Setup

### 1. Clone and install

```bash
cd WebCastle
npm install
```

### 2. Environment variables

Copy the example env and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same place |
| `TWILIO_ACCOUNT_SID` | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_PHONE_NUMBER` | Your Twilio number (e.g. +1234567890) |
| `CRON_SECRET` | Random secret for securing the cron endpoint |
| `DATABASE_URL` | Prisma DB URL, e.g. `file:./dev.db` for SQLite |

**Google Cloud:**

- Create OAuth 2.0 Client ID (Web application).
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL when deployed).
- Enable **Google Calendar API** for the project.

### 3. Database

```bash
npm run db:generate
npm run db:push
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, allow Calendar access, then go to the dashboard and add your phone number (E.164, e.g. `+1234567890`).

### 5. Cron (production / local testing)

The app exposes a **secured** cron endpoint that performs the reminder logic:

- **URL:** `GET /api/cron/check-events`
- **Auth:** `Authorization: Bearer <CRON_SECRET>`

**Vercel:** The repo includes `vercel.json` so the cron runs every 5 minutes. Set the `CRON_SECRET` env var in your Vercel project; Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the cron.

**Local / other platforms:** Call the endpoint every 5 minutes with the same header, e.g.:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/check-events"
```

## Project structure

```
src/
  app/
    api/
      auth/[...nextauth]/   # NextAuth routes
      calendar/events/      # GET upcoming events (auth)
      cron/check-events/   # Cron: check calendars, place Twilio calls (CRON_SECRET)
      twilio/voice/        # Twilio webhook: TwiML for reminder message
      user/phone/          # GET/PUT user phone number (auth)
    dashboard/             # Protected dashboard (phone input, upcoming events)
    layout.tsx
    page.tsx               # Landing / sign-in
  components/
    ui/                    # Button, Input, Card, Label
  lib/
    auth.ts                # NextAuth config (Google + Calendar scope)
    db.ts                  # Prisma client
    google-calendar.ts     # Calendar API + token refresh
    twilio.ts              # Twilio client + placeReminderCall
    utils.ts               # cn, phone validation
prisma/
  schema.prisma            # User, Account, Session, ReminderSent
vercel.json                # Cron schedule
```

## Security and edge cases

- **Cron endpoint** is protected by `CRON_SECRET`; no secret → 401.
- **Phone numbers** validated and normalized to E.164 before save.
- **Idempotency:** `ReminderSent` table ensures we don’t call the same user twice for the same event (same `userId`, `eventId`, `startAt`).
- **Google tokens:** Access token is refreshed when expired using the stored refresh token (with `prompt: "consent"` on first sign-in to get refresh token).
- **Session:** Database-backed sessions; `session.user.id` set in callback for API routes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema (no migrations) |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT
