"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-card-foreground shadow-lg",
          success: "border-success/30",
          error: "border-destructive/30",
        },
      }}
    />
  );
}
