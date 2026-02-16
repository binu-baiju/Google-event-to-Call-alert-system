import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Basic E.164 validation: + and 10-15 digits.
 * For production you might use libphonenumber for full validation.
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{9,14}$/.test(phone.replace(/\s/g, ""));
}

/**
 * Normalize to E.164: strip spaces/dashes, ensure leading +.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10 && digits.length <= 15) {
    return digits.startsWith("0") ? `+${digits.slice(1)}` : `+${digits}`;
  }
  return phone;
}
