import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatRole } from "@/lib/utils";

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
      // Signup records licenses; the free-text specialties list was only ever
      // filled in by the old onboarding flow, so fall back to licenses.
      specialties:
        tp.specialties.length > 0 ? tp.specialties : tp.licenses.map(formatRole),
      portfolio: tp.portfolio.map((p) => p.url),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
