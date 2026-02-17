import { ScrollFadeUp, StaggerGroup, StaggerItem } from "@/components/motion";

const TECHS = [
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
];

export function TechStack() {
  return (
    <section className="border-t border-border bg-card/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <ScrollFadeUp>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Tech Stack
            </h2>
            <p className="mt-3 text-muted-foreground">
              Modern, type-safe, and production-ready.
            </p>
          </div>
        </ScrollFadeUp>

        <StaggerGroup className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-3">
          {TECHS.map((tech) => (
            <StaggerItem key={tech}>
              <span className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {tech}
              </span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
