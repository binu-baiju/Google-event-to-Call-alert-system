"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Calendar, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [, setSavedPhone] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; summary: string; start: string }[]>([]);
  const [loadingPhone, setLoadingPhone] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
        setSaving(false);
        return;
      }
      setSavedPhone(data.phoneNumber);
      setPhoneNumber(data.phoneNumber);
      setMessage({ type: "success", text: "Phone number saved. You will receive call reminders for events in the next 5 minutes." });
    } catch {
      setMessage({ type: "error", text: "Network error" });
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
        setMessage({ type: "success", text: "No events in the next 5 minutes." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoadingEvents(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Add your phone number to get automated call reminders for Google Calendar events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone number
          </CardTitle>
          <CardDescription>
            We will call this number when you have an event starting in the next 5 minutes. Use E.164 format (e.g. +1234567890).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPhone ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="phone" className="sr-only">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={saving}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming events
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
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
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{e.summary}</span>
                  <span className="text-muted-foreground">
                    {new Date(e.start).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : !loadingEvents && events.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Click &quot;Refresh upcoming events&quot; to check for events in the next 5 minutes.
            </p>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
