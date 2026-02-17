import { prisma } from "@/lib/db";

/** Get a user's phone number. */
export async function getUserPhone(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneNumber: true },
  });
  return user?.phoneNumber ?? null;
}

/** Update a user's phone number. */
export async function updateUserPhone(userId: string, phoneNumber: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { phoneNumber },
  });
}

/** Get all users who have a phone number set. */
export async function getUsersWithPhone() {
  return prisma.user.findMany({
    where: { phoneNumber: { not: null } },
    select: { id: true, phoneNumber: true },
  });
}
