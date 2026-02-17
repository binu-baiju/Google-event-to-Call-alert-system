import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton } from "@/components/sign-in-button";
import { cn } from "@/lib/utils";
import { FadeUp, FadeIn } from "@/components/motion";
import type { Session } from "next-auth";

interface HeroProps {
  session: Session | null;
  error?: string;
}

export function Hero({ session, error }: HeroProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(47_96%_53%/0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <FadeUp delay={0.2}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-subtle" />
            Google Calendar + Twilio Integration
          </div>
        </FadeUp>

        <FadeUp delay={0.35}>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Never miss an event.
            <br />
            <span className="text-muted-foreground">
              Get called before it starts.
            </span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.5}>
          <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
            Connect your Google Calendar and receive an automated phone call
            reminder before every upcoming event. Simple, reliable, hands-free.
          </p>
        </FadeUp>

        <FadeUp delay={0.65}>
          <div className="mt-10 flex flex-col items-center gap-4">
            {error && (
              <div className="w-full max-w-xs rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
                <p className="text-foreground">
                  {error === "Callback"
                    ? "Sign-in failed. Please try again."
                    : error === "OAuthAccountNotLinked"
                      ? "Account could not be linked. Please try again."
                      : error === "AccessDenied"
                        ? "Sign-in was cancelled or denied."
                        : "Sign-in failed. Please try again."}
                </p>
                <Link
                  href="/"
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  Dismiss
                </Link>
              </div>
            )}

            {session?.user ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Signed in as{" "}
                  <span className="text-foreground">{session.user.email}</span>
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
        </FadeUp>
      </div>

      <FadeIn delay={1.2}>
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
      </FadeIn>
    </section>
  );
}
