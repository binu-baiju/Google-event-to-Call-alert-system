import { ScrollFadeUp, StaggerGroup, StaggerItem } from "@/components/motion";

const STEPS = [
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
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <ScrollFadeUp>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps to automated event reminders.
            </p>
          </div>
        </ScrollFadeUp>

        <StaggerGroup className="mt-16 grid gap-8 sm:grid-cols-3">
          {STEPS.map((item) => (
            <StaggerItem key={item.step}>
              <div className="group relative">
                <div className="mb-4 font-mono text-xs text-primary">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
