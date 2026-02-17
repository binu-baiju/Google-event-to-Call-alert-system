import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton } from "@/components/sign-in-button";
import { cn } from "@/lib/utils";
import { Phone, Calendar, Shield, Zap } from "lucide-react";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">CalRemind</span>
          </div>
          {session?.user ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/binu-baiju/Google-event-to-Call-alert-system"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                )}
              >
                GitHub
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14">
          {/* Subtle radial gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(47_96%_53%/0.04)_0%,transparent_70%)]" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-subtle" />
              Google Calendar + Twilio Integration
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Never miss an event.
              <br />
              <span className="text-muted-foreground">
                Get called before it starts.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
              Connect your Google Calendar and receive an automated phone call
              reminder before every upcoming event. Simple, reliable, hands-free.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              {error && (
                <div className="w-full max-w-xs rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error === "Callback"
                    ? "Sign-in failed. Please try again."
                    : error === "OAuthAccountNotLinked"
                      ? "Account could not be linked. Please try again."
                      : error === "AccessDenied"
                        ? "Access denied. Ensure you are a test user."
                        : "Sign-in failed. Please try again."}
                </div>
              )}

              {session?.user ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Signed in as{" "}
                    <span className="text-foreground">
                      {session.user.email}
                    </span>
                  </p>
                  <Link
                    href="/dashboard"
                    className={cn(buttonVariants({ size: "lg" }), "px-8")}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <span>How it works</span>
            <svg
              className="h-4 w-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border bg-card/50 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p className="mt-3 text-muted-foreground">
                Three steps to automated event reminders.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Sign in with Google",
                  description:
                    "Authenticate securely and grant read-only access to your Google Calendar.",
                },
                {
                  step: "02",
                  title: "Add your phone number",
                  description:
                    "Enter your phone number in E.164 format. This is the number we will call.",
                },
                {
                  step: "03",
                  title: "Get called before events",
                  description:
                    "A cron job checks every 5 minutes and calls you with the event details.",
                },
              ].map((item) => (
                <div key={item.step} className="group relative">
                  <div className="mb-4 font-mono text-xs text-primary">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built with best practices
              </h2>
              <p className="mt-3 text-muted-foreground">
                Production-ready architecture with security and reliability in mind.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Calendar,
                  title: "Google Calendar",
                  description: "Read-only access with automatic token refresh.",
                },
                {
                  icon: Phone,
                  title: "Twilio Calls",
                  description: "Voice calls with event name and start time.",
                },
                {
                  icon: Shield,
                  title: "Secure",
                  description: "OAuth 2.0, encrypted tokens, CRON_SECRET auth.",
                },
                {
                  icon: Zap,
                  title: "Idempotent",
                  description: "No duplicate calls. Smart deduplication built-in.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border/80 hover:bg-secondary/30"
                >
                  <feature.icon className="mb-3 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-border bg-card/50 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Tech Stack
              </h2>
              <p className="mt-3 text-muted-foreground">
                Modern, type-safe, and production-ready.
              </p>
            </div>

            <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-3">
              {[
                "Next.js 15",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "NextAuth.js",
                "Prisma",
                "PostgreSQL",
                "Twilio",
                "Google Calendar API",
                "Vercel",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
                <Phone className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
              <span>CalRemind</span>
            </div>
            <span>Built with Next.js + Twilio</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
