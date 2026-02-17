"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Calendar, Loader2, Clock, CheckCircle2 } from "lucide-react";

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch saved phone number on mount
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

  // Fetch reminder history
  const fetchReminders = useCallback(async () => {
    setLoadingReminders(true);
    try {
      const res = await fetch("/api/reminders/history");
      const data = await res.json();
      if (res.ok) {
        setReminders(data.reminders ?? []);
      }
    } catch {
      // Silently fail — not critical
    }
    setLoadingReminders(false);
  }, []);

  // Load reminder history on mount
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
        text: "Phone number saved. You will receive call reminders for upcoming events.",
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
        setMessage({ type: "error", text: data.error ?? "Failed to load events" });
        setLoadingEvents(false);
        return;
      }
      setEvents(data.events ?? []);
      if ((data.events ?? []).length === 0) {
        setMessage({ type: "success", text: "No events starting in the next 5 minutes." });
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Add your phone number to receive automated call reminders for Google Calendar events starting in the next 5 minutes.
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Phone number card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number
          </CardTitle>
          <CardDescription>
            We will call this number when you have an event starting in the next 5 minutes.
            Use E.164 format (e.g. +919876543210).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPhone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <form onSubmit={handleSavePhone} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
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
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              {savedPhone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Currently saved: {savedPhone}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Upcoming events card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Events starting in the next 5 minutes. The cron job will call you for each of these if your phone is saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={fetchUpcoming}
            disabled={loadingEvents}
            className="mb-4"
          >
            {loadingEvents ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Loading...
              </>
            ) : (
              "Refresh upcoming events"
            )}
          </Button>
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
                >
                  <span className="font-medium">{e.summary}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatTime(e.start)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            !loadingEvents && (
              <p className="text-sm text-muted-foreground">
                Click &quot;Refresh upcoming events&quot; to check for events in the next 5 minutes.
              </p>
            )
          )}
        </CardContent>
      </Card>

      {/* Call history card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Call History
          </CardTitle>
          <CardDescription>
            Recent call reminders sent to your phone. Shows the last 20 reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={fetchReminders}
            disabled={loadingReminders}
            className="mb-4"
          >
            {loadingReminders ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Loading...
              </>
            ) : (
              "Refresh history"
            )}
          </Button>
          {reminders.length > 0 ? (
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-muted-foreground">
                      Event at {formatTime(r.eventStartAt)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Called {formatTime(r.calledAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            !loadingReminders && (
              <p className="text-sm text-muted-foreground">
                No call reminders sent yet. Create a Google Calendar event starting in the next 5 minutes, then trigger the cron job.
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
