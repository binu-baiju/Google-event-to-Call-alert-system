"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Loader2,
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import { useReminderHistory } from "@/hooks/use-reminders";
import { formatTime } from "@/lib/format";

export function CallHistory() {
  const reminders = useReminderHistory();
  const reminderList = reminders.data?.reminders ?? [];

  return (
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
            onClick={() => reminders.refetch()}
            disabled={reminders.isFetching}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            {reminders.isFetching ? (
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
        {reminders.isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive/50" />
            <p className="text-sm text-destructive">Failed to load history</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reminders.refetch()}
              className="mt-2 text-xs"
            >
              Try again
            </Button>
          </div>
        ) : reminderList.length > 0 ? (
          <ul className="space-y-2">
            {reminderList.map((r) => (
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
            <p className="text-sm text-muted-foreground">No calls sent yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Calls appear here after the cron job triggers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
