import { prisma } from "./db";

/** Free accounts may have this many live listings at a time. */
export const FREE_LISTING_LIMIT = 1;

/**
 * How many live listings a scout has: status "active" and not past expiry.
 * Pass `excludeJobId` when checking whether one of their own listings may be
 * activated or renewed, so that listing is not counted against itself.
 */
export async function countLiveListings(
  userId: string,
  excludeJobId?: string
): Promise<number> {
  return prisma.job.count({
    where: {
      employerProfile: { userId },
      status: "active",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      ...(excludeJobId ? { id: { not: excludeJobId } } : {}),
    },
  });
}

interface PrivateLocationFields {
  addressLine1: string | null;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * The location to send to the public. When the scout turned off "Show exact
 * address", the street address and exact coordinates are removed here, on the
 * server, so they never reach the browser. City and state stay, which is what
 * the list and the approximate map pin use.
 */
export function publicLocation<T extends PrivateLocationFields>(
  location: T | null,
  addressVisible: boolean
): T | null {
  if (!location || addressVisible) return location;
  return { ...location, addressLine1: null, postalCode: null, lat: null, lng: null };
}
