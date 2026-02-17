"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar,
  Loader2,
  Clock,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  CalendarClock,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
}

interface ReminderRecord {
  id: string;
  eventId: string;
  eventStartAt: string;
  calledAt: string;
}

export default function DashboardPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [loadingPhone, setLoadingPhone] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/user/phone")
      .then((r) => r.json())
      .then((data) => {
        if (data.phoneNumber) {
          setSavedPhone(data.phoneNumber);
          setPhoneNumber(data.phoneNumber);
        }
        setLoadingPhone(false);
      })
      .catch(() => setLoadingPhone(false));
  }, []);

  const fetchReminders = useCallback(async () => {
    setLoadingReminders(true);
    try {
      const res = await fetch("/api/reminders/history");
      const data = await res.json();
      if (res.ok) {
        setReminders(data.reminders ?? []);
      }
    } catch {
      // Silently fail
    }
    setLoadingReminders(false);
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Please enter a phone number." });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
        setSaving(false);
        return;
      }
      setSavedPhone(data.phoneNumber);
      setPhoneNumber(data.phoneNumber);
      setMessage({
        type: "success",
        text: "Phone number saved successfully.",
      });
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
    setSaving(false);
  };

  const fetchUpcoming = async () => {
    setLoadingEvents(true);
    setMessage(null);
    try {
      const res = await fetch("/api/calendar/events");
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error ?? "Failed to load events",
        });
        setLoadingEvents(false);
        return;
      }
      setEvents(data.events ?? []);
      if ((data.events ?? []).length === 0) {
        setMessage({
          type: "success",
          text: "No events in the next 5 minutes.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
    setLoadingEvents(false);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatRelative = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    const mins = Math.round(diff / 60000);
    if (mins <= 0) return "now";
    if (mins === 1) return "in 1 min";
    return `in ${mins} min`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your phone number and view upcoming calendar events with call
          reminders.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="truncate text-sm font-medium">
                {loadingPhone ? "..." : savedPhone ?? "Not set"}
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
                {events.length} event{events.length !== 1 && "s"}
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
              <p className="text-sm font-medium">{reminders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-success/20 bg-success/5 text-success"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Phone number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </CardTitle>
          <CardDescription>
            Enter your number in E.164 format. We will call this number when an
            event starts within 5 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPhone ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <form onSubmit={handleSavePhone} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="phone" className="sr-only">
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <Button type="submit" disabled={saving} className="shrink-0">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save number"
                  )}
                </Button>
              </div>
              {savedPhone && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Active: {savedPhone}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Two-column layout for events and history */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Upcoming Events
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchUpcoming}
                disabled={loadingEvents}
                className="h-8 gap-1.5 text-xs text-muted-foreground"
              >
                {loadingEvents ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Refresh
              </Button>
            </div>
            <CardDescription>
              Events starting in the next 5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <ul className="space-y-2">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.summary}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(e.start)}
                      </p>
                    </div>
                    <Badge variant="warning" className="shrink-0">
                      {formatRelative(e.start)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Click refresh to check your calendar
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call history */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Call History
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchReminders}
                disabled={loadingReminders}
                className="h-8 gap-1.5 text-xs text-muted-foreground"
              >
                {loadingReminders ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Refresh
              </Button>
            </div>
            <CardDescription>
              Recent call reminders sent to your phone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <ul className="space-y-2">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      <span className="text-sm text-muted-foreground">
                        Event at {formatTime(r.eventStartAt)}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground/70">
                      {formatTime(r.calledAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PhoneCall className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No calls sent yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Calls appear here after the cron job triggers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
