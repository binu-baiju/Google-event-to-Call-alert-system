# Google Calendar → Call Alert System

A full-stack web application that integrates Google OAuth, Google Calendar API, and Twilio to provide automated phone call reminders for upcoming calendar events.

Users sign in with Google, grant Calendar read access, set their phone number, and receive an automated phone call when an event starts within the next 5 minutes.

**Live Demo:** [https://google-event-to-call-alert-system-zeta.vercel.app](https://google-event-to-call-alert-system-zeta.vercel.app)

---

## Assignment requirements (mapping)

| Requirement | Implementation |
|-------------|----------------|
| **Scalable platform** | Vercel + PostgreSQL (Neon); serverless API routes |
| **Google OAuth + Calendar API** | NextAuth.js Google provider; `calendar.readonly`; token refresh in `src/lib/google-calendar.ts` |
| **Twilio for phone call notifications** | `src/lib/twilio.ts` (inline TwiML); `/api/cron/check-events` triggers calls |
| **Next.js 15 (App Router) + TypeScript** | App Router throughout; full TypeScript |
| **Tailwind CSS + shadcn/ui** | Tailwind + shadcn-style components in `src/components/ui/` |
| **Backend: Node.js + TypeScript** | API routes in `src/app/api/`; Prisma, NextAuth, server-side logic |
| **Clean, well-structured code** | `src/lib/api/` (Axios + services), `src/hooks/` (React Query), `src/lib/validations/` (Zod), `src/types/` |
| **Security** | CRON_SECRET for cron; session auth; E.164 validation (Zod + server); no secrets in client |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui components |
| **Forms & validation** | React Hook Form, Zod, @hookform/resolvers |
| **Notifications** | Sonner (toast) |
| **Data fetching** | TanStack React Query, Axios |
| **Authentication** | NextAuth.js v4 (Google OAuth) |
| **Database** | PostgreSQL (Neon) via Prisma ORM |
| **Calendar** | Google Calendar API (googleapis) |
| **Phone Calls** | Twilio Programmable Voice |
| **Hosting** | Vercel |
| **Cron** | External scheduler (e.g. cron-job.org) |

---

## Features

- **Google OAuth** — Secure login with Google, requesting `calendar.readonly` scope
- **Token Refresh** — Automatically refreshes expired Google access tokens using stored refresh tokens
- **Phone Number Management** — Users can set/update their phone number (validated to E.164 format)
- **Event Detection** — Fetches upcoming events from Google Calendar starting within the next 5 minutes
- **Automated Phone Calls** — Twilio calls the user and speaks the event name and start time
- **Idempotent Reminders** — `ReminderSent` table prevents duplicate calls for the same event
- **Call History** — Dashboard displays recent call reminders for transparency
- **Forms & validation** — React Hook Form + Zod (e.g. phone form with E.164); Sonner for toast notifications
- **Edge Case Handling:**
  - All-day events are automatically skipped (no specific time to call for)
  - Cancelled events are filtered out
  - Token refresh failures handled gracefully (user is skipped, not crashed)
  - Event timezone from Google Calendar is used for accurate spoken time
  - Individual call failures don't block other users or events

---

## Prerequisites

- **Node.js** 18+
- **Google Cloud Console** — OAuth 2.0 Client ID (Web) with Calendar API enabled
- **Twilio** account — Account SID, Auth Token, and a phone number for outbound calls
- **PostgreSQL** database (Neon recommended for Vercel deployment)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/binu-baiju/Google-event-to-Call-alert-system.git
cd Google-event-to-Call-alert-system
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` for local) |
| `NEXTAUTH_SECRET` | Random secret: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same place |
| `TWILIO_ACCOUNT_SID` | From Twilio Console |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_PHONE_NUMBER` | Your Twilio number in E.164 (e.g. `+1234567890`) |
| `CRON_SECRET` | Random secret: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string |

### 3. Google Cloud setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Library** and enable **Google Calendar API**
4. Go to **APIs & Services → Credentials** → Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Go to **OAuth consent screen** → Add your email as a test user (required while app is in "Testing" mode)

### 4. Database setup

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Create database tables
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, allow Calendar access, and set your phone number on the dashboard.

### 6. Test the cron job

The cron endpoint checks for upcoming events and triggers Twilio calls:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/check-events
```

> **Note:** For Twilio to make calls, the app must be deployed to a publicly accessible URL (Twilio trial accounts can only call verified phone numbers).

---

## Troubleshooting

### Cron runs but "0 calls placed"

The cron only places a call when an event **starts within the next 5 minutes** (from the server’s time, usually UTC). In Vercel logs you’ll see:

- **`[Cron] Window ... to ...`** — The exact time range used. Your event’s start time (in UTC) must fall inside this window.
- **`User <id>: 0 events in next 5 minutes`** — No events in that window (e.g. event is later, or already started).
- **`User <id>: N event(s) in window but all already reminded`** — Events were in the window but reminders were already sent (idempotency).

So: create a test event that starts in **under 5 minutes** from when the cron runs, or run the cron every 1–2 minutes so it catches the window.

### `DEP0169 DeprecationWarning: url.parse()`

This comes from a dependency (e.g. NextAuth or a transitive package), not from this repo. It’s a Node.js deprecation and does not break the app. You can ignore it or run with `node --trace-deprecation` to see the source; upgrading the dependency when a fix is released will remove it.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                         │
│                                                          │
│  ┌──────────┐    ┌────────────┐    ┌──────────────────┐ │
│  │  Pages    │    │ API Routes │    │  Cron Endpoint   │ │
│  │  (React)  │    │            │    │  /api/cron/      │ │
│  │           │    │ /api/auth/ │    │  check-events    │ │
│  │ - Home    │    │ /api/user/ │    │                  │ │
│  │ - Dash    │    │ /api/cal/  │    │ ┌──────────────┐ │ │
│  └──────────┘    └────────────┘    │ │ For each user │ │ │
│                                     │ │ with phone:   │ │ │
│                                     │ │               │ │ │
│                                     │ │ 1. Get events │ │ │
│                                     │ │ 2. Check dups │ │ │
│                                     │ │ 3. Call via   │ │ │
│                                     │ │    Twilio     │ │ │
│                                     │ │ 4. Record it  │ │ │
│                                     │ └──────────────┘ │ │
│                                     └──────────────────┘ │
└────────────┬──────────────┬──────────────┬───────────────┘
             │              │              │
     ┌───────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │ Google OAuth  │ │ Postgres │ │   Twilio    │
     │ + Calendar    │ │  (Neon)  │ │   Voice     │
     │    API        │ │          │ │    API      │
     └──────────────┘ └──────────┘ └─────────────┘
```

---

## Project Structure

```
src/
  app/
    api/
      auth/[...nextauth]/     # NextAuth.js OAuth routes
      calendar/events/         # GET: Upcoming events for current user
      cron/check-events/       # GET: Cron — check calendars, place calls (secured)
      reminders/history/       # GET: Call history for current user
      twilio/voice/            # GET/POST: Twilio TwiML webhook
      user/phone/              # GET/PUT: User phone number (E.164)
    dashboard/
      layout.tsx               # Auth-protected layout with navbar
      page.tsx                 # Phone input, upcoming events, call history
    layout.tsx                 # Root layout (fonts, providers)
    page.tsx                   # Landing page / sign-in
  components/
    ui/                        # Button, Input, Card, Label (shadcn/ui style)
    providers.tsx              # NextAuth SessionProvider wrapper
    sign-in-button.tsx         # Google sign-in button (client component)
  lib/
    auth.ts                    # NextAuth config (Google + Calendar scope)
    db.ts                      # Prisma client singleton
    env.ts                     # Zod environment variable validation
    google-calendar.ts         # Calendar API: token refresh + event fetching
    twilio.ts                  # Twilio: inline TwiML + call placement
    utils.ts                   # cn(), phone validation helpers
prisma/
  schema.prisma                # User, Account, Session, ReminderSent models
vercel.json                    # Vercel deployment config
```

---

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET/POST` | `/api/auth/*` | Public | NextAuth.js OAuth handlers |
| `GET` | `/api/calendar/events` | Session | Fetch upcoming events (next 5 min) |
| `GET/PUT` | `/api/user/phone` | Session | Get/update phone number |
| `GET` | `/api/cron/check-events` | CRON_SECRET | Check events and trigger calls |
| `GET` | `/api/reminders/history` | Session | Recent call reminder history |
| `GET/POST` | `/api/twilio/voice` | Public | TwiML webhook for Twilio |

---

## Security Considerations

- **Cron endpoint** protected by `CRON_SECRET` — returns 401 without valid Bearer token
- **Phone numbers** validated and normalized to E.164 format with Zod
- **Google tokens** stored in the database via NextAuth Prisma adapter; access tokens refreshed automatically
- **Session** backed by database (not JWT) for revocability
- **Environment variables** validated at runtime using Zod schemas
- **No sensitive data** exposed to the client; all API calls are server-side authenticated

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Add production redirect URI in Google Cloud Console:
   `https://your-domain.vercel.app/api/auth/callback/google`
5. Database tables are auto-created during build (`prisma db push` runs in the build script)
6. For cron scheduling, use [cron-job.org](https://cron-job.org) (free) to call the cron endpoint every 5 minutes with the `Authorization: Bearer <CRON_SECRET>` header

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build (generates Prisma client + pushes schema) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## License

MIT
