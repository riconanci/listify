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

    const { name, phone, avatarUrl, portfolioPhotos, shopName, shopAddress, website } = parsed.data;

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    });

    // Update talent profile
    if (user.role === "talent") {
      const talentProfile = await prisma.talentProfile.findUnique({
        where: { userId: user.id },
      });

      if (talentProfile) {
        if (avatarUrl !== undefined) {
          await prisma.talentProfile.update({
            where: { userId: user.id },
            data: { avatarUrl },
          });
        }

        // Handle portfolio photos — replace all with new set
        if (portfolioPhotos !== undefined) {
          // Delete existing photos
          await prisma.portfolioPhoto.deleteMany({
            where: { talentProfileId: talentProfile.id },
          });

          // Create new photos
          if (portfolioPhotos.length > 0) {
            await prisma.portfolioPhoto.createMany({
              data: portfolioPhotos.map((url, i) => ({
                talentProfileId: talentProfile.id,
                url,
                sortOrder: i,
              })),
            });
          }
        }
      }
    }

    // Update employer profile if scout
    if (user.role === "employer" && user.employerProfiles?.[0]) {
      const profileId = user.employerProfiles[0].id;
      await prisma.employerProfile.update({
        where: { id: profileId },
        data: {
          ...(shopName !== undefined && { shopName }),
          ...(website !== undefined && { website }),
          ...(avatarUrl !== undefined && { logoUrl: avatarUrl }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PROFILE UPDATE ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
