import { Calendar, Phone, Shield, Zap } from "lucide-react";
import {
  ScrollFadeUp,
  StaggerGroupSlow,
  StaggerItem,
} from "@/components/motion";

const FEATURES = [
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
];

export function Features() {
  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <ScrollFadeUp>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built with best practices
            </h2>
            <p className="mt-3 text-muted-foreground">
              Production-ready architecture with security and reliability in
              mind.
            </p>
          </div>
        </ScrollFadeUp>

        <StaggerGroupSlow className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border/80 hover:bg-secondary/30">
                <feature.icon className="mb-3 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroupSlow>
      </div>
    </section>
  );
}
