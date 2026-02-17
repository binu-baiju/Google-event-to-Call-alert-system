"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Phone, Loader2, CheckCircle2 } from "lucide-react";
import { usePhone, useUpdatePhone } from "@/hooks/use-phone";
import { phoneFormSchema, type PhoneFormValues } from "@/lib/validations/phone";

export function PhoneForm() {
  const phone = usePhone();
  const updatePhone = useUpdatePhone();
  const savedPhone = phone.data?.phoneNumber ?? null;
  const hasSynced = useRef(false);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneNumber: "" },
  });

  useEffect(() => {
    if (phone.isSuccess && savedPhone && !hasSynced.current) {
      hasSynced.current = true;
      form.reset({ phoneNumber: savedPhone });
    }
  }, [phone.isSuccess, savedPhone, form]);

  const onSubmit = (data: PhoneFormValues) => {
    updatePhone.mutate(data.phoneNumber, {
      onSuccess: (res) => {
        form.reset({ phoneNumber: res.phoneNumber ?? "" });
        toast.success("Phone number saved successfully.");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to save.");
      },
    });
  };

  return (
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
        {phone.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : phone.isError ? (
          <p className="text-sm text-destructive">
            Failed to load phone number. Please refresh the page.
          </p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="phone" className="sr-only">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  disabled={updatePhone.isPending}
                  {...form.register("phoneNumber")}
                />
                {form.formState.errors.phoneNumber && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={updatePhone.isPending}
                className="shrink-0"
              >
                {updatePhone.isPending ? (
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
  );
}
