"use client";

import { signIn } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className={cn(buttonVariants({ size: "lg" }), "w-full")}
    >
      Sign in with Google
    </button>
  );
}
