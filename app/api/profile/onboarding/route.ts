import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, createSession } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validation";

// POST /api/profile/onboarding — Complete onboarding
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { role, specialties } = parsed.data;

    // Update user role and mark as onboarded
    await prisma.user.update({
      where: { id: user.id },
      data: { role, onboarded: true },
    });

    // Update or create profile with specialties
    if (role === "talent") {
      await prisma.talentProfile.upsert({
        where: { userId: user.id },
        update: { specialties: specialties || [] },
        create: {
          userId: user.id,
          specialties: specialties || [],
        },
      });
    } else {
      await prisma.employerProfile.upsert({
        where: {
          id: (await prisma.employerProfile.findFirst({
            where: { userId: user.id },
          }))?.id || "new",
        },
        update: { services: specialties || [] },
        create: {
          userId: user.id,
          shopName: user.name || "My Shop",
          services: specialties || [],
        },
      });
    }

    // Refresh session
    await createSession(user.id, role);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
