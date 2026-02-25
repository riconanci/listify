import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: { id: string };
}

// GET /api/users/[id]/profile — Public talent profile
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        talentProfile: {
          include: {
            portfolio: { orderBy: { sortOrder: "asc" }, take: 12 },
          },
        },
      },
    });

    if (!user || !user.talentProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const tp = user.talentProfile;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      headline: tp.headline,
      verified: tp.verified,
      yearsExperience: tp.yearsExperience,
      bio: tp.bio,
      website: tp.website,
      instagram: tp.instagram,
      avatarUrl: tp.avatarUrl,
      specialties: tp.specialties,
      portfolio: tp.portfolio.map((p) => p.url),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
