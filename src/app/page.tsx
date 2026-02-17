import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton } from "@/components/sign-in-button";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { error } = await searchParams;

  if (session?.user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">You are signed in as {session.user.email}</p>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Calendar Call Reminders</h1>
          <p className="text-muted-foreground">
            Connect your Google Calendar and get a phone call before each event.
          </p>
        </div>
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {error === "Callback"
              ? "Sign-in failed due to a server error. Please try again or contact support."
              : error === "OAuthAccountNotLinked"
                ? "This Google account could not be linked. Please try signing in again."
                : error === "AccessDenied"
                  ? "Access denied. Please ensure you have been added as a test user in Google Cloud Console."
                  : "Sign-in failed. Please try again."}
          </div>
        )}
        <SignInButton />
      </div>
    </main>
  );
}
