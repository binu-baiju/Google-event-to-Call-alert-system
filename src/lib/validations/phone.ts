import { z } from "zod";
import { isValidE164, normalizePhone } from "@/lib/utils";

/** Client-side schema for the phone number form. Matches server E.164 rules. */
export const phoneFormSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .transform((s) => s.trim()),
  })
  .refine(
    (data) => isValidE164(normalizePhone(data.phoneNumber)),
    {
      message: "Use E.164 format (e.g. +919876543210)",
      path: ["phoneNumber"],
    },
  )
  .transform((data) => ({
    phoneNumber: normalizePhone(data.phoneNumber),
  }));

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
