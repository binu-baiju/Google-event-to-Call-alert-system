import { Phone } from "lucide-react";

export function Footer() {
  return (
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
  );
}
