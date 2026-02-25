import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "listify-dev-secret-change-in-production"
);
const COOKIE_NAME = "listify-session";
const EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  role: string;
}

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRY)
    .setIssuedAt()
    .sign(SESSION_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      onboarded: true,
      createdAt: true,
      employerProfiles: {
        select: {
          id: true,
          shopName: true,
          about: true,
          phone: true,
          website: true,
          verified: true,
        },
      },
      talentProfile: {
        select: {
          id: true,
          headline: true,
          bio: true,
          verified: true,
          specialties: true,
        },
      },
    },
  });

  return user;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
