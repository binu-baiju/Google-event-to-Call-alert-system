"use client";

import { Phone, CalendarClock, PhoneCall } from "lucide-react";

interface StatusCardsProps {
  phoneLoading: boolean;
  savedPhone: string | null;
  eventCount: number;
  reminderCount: number;
}

export function StatusCards({
  phoneLoading,
  savedPhone,
  eventCount,
  reminderCount,
}: StatusCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Phone className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="truncate text-sm font-medium">
              {phoneLoading ? "..." : savedPhone ?? "Not set"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
            <p className="text-sm font-medium">
              {eventCount} event{eventCount !== 1 && "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Calls Sent</p>
            <p className="text-sm font-medium">{reminderCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
