import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validation";

// PUT /api/profile — Update user profile
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, shopName, shopAddress, website } = parsed.data;

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    });

    // Update employer profile if scout
    if (user.role === "employer" && user.employerProfiles?.[0]) {
      const profileId = user.employerProfiles[0].id;
      await prisma.employerProfile.update({
        where: { id: profileId },
        data: {
          ...(shopName !== undefined && { shopName }),
          ...(website !== undefined && { website }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
