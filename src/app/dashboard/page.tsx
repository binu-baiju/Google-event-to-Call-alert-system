"use client";

import { StatusCards } from "@/components/dashboard/status-cards";
import { PhoneForm } from "@/components/dashboard/phone-form";
import { EventList } from "@/components/dashboard/event-list";
import { CallHistory } from "@/components/dashboard/call-history";
import { usePhone } from "@/hooks/use-phone";
import { useUpcomingEvents } from "@/hooks/use-events";
import { useReminderHistory } from "@/hooks/use-reminders";

export default function DashboardPage() {
  const phone = usePhone();
  const events = useUpcomingEvents();
  const reminders = useReminderHistory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your phone number and view upcoming calendar events with call
          reminders.
        </p>
      </div>

      <StatusCards
        phoneLoading={phone.isLoading}
        savedPhone={phone.data?.phoneNumber ?? null}
        eventCount={events.data?.events.length ?? 0}
        reminderCount={reminders.data?.reminders.length ?? 0}
      />

      <PhoneForm />

      <div className="grid gap-6 lg:grid-cols-2">
        <EventList />
        <CallHistory />
      </div>
    </div>
  );
}
