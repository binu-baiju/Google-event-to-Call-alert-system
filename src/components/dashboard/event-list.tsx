"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useUpcomingEvents } from "@/hooks/use-events";
import { formatTime, formatRelative } from "@/lib/format";

export function EventList() {
  const events = useUpcomingEvents();
  const eventList = events.data?.events ?? [];

  const handleRefresh = () => {
    events.refetch().then((result) => {
      if (result.data?.events.length === 0) {
        toast.info("No events in the next 5 minutes.");
      }
    });
  };

  return (
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
            onClick={handleRefresh}
            disabled={events.isFetching}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            {events.isFetching ? (
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
        {events.isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive/50" />
            <p className="text-sm text-destructive">
              Failed to load events
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-xs"
            >
              Try again
            </Button>
          </div>
        ) : eventList.length > 0 ? (
          <ul className="space-y-2">
            {eventList.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.summary}</p>
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
  );
}
