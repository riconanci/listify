import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, createSession } from "@/lib/auth";
import { switchRoleSchema } from "@/lib/validation";

// POST /api/profile/role — Switch user role (talent ↔ employer)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = switchRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { role } = parsed.data;

    // If switching to employer, ensure profile exists
    if (role === "employer") {
      const existing = await prisma.employerProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existing) {
        await prisma.employerProfile.create({
          data: {
            userId: user.id,
            shopName: user.name || "My Shop",
          },
        });
      }
    }

    // If switching to talent, ensure profile exists
    if (role === "talent") {
      const existing = await prisma.talentProfile.findUnique({
        where: { userId: user.id },
      });
      if (!existing) {
        await prisma.talentProfile.create({
          data: { userId: user.id },
        });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    // Refresh session with new role
    await createSession(user.id, role);

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to switch role" },
      { status: 500 }
    );
  }
}
