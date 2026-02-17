"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPhone, updatePhone } from "@/lib/api/services";

/** Query key for the phone number. */
export const phoneKeys = {
  all: ["phone"] as const,
};

/** Fetch the user's saved phone number. */
export function usePhone() {
  return useQuery({
    queryKey: phoneKeys.all,
    queryFn: getPhone,
  });
}

/** Mutation to update the phone number with optimistic cache update. */
export function useUpdatePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phoneNumber: string) => updatePhone(phoneNumber),
    onSuccess: (data) => {
      queryClient.setQueryData(phoneKeys.all, data);
    },
  });
}
