import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: { id: string };
}

// GET /api/shops/[id]/profile — Public shop profile
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const profile = await prisma.employerProfile.findUnique({
      where: { id },
      include: {
        location: true,
        jobs: {
          where: { status: "active" },
          select: {
            id: true,
            title: true,
            schedule: true,
            compModel: true,
            payMin: true,
            payMax: true,
            payUnit: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            followers: true,
            jobs: { where: { status: "active" } },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: profile.id,
      shopName: profile.shopName,
      about: profile.about,
      website: profile.website,
      instagram: profile.instagram,
      coverUrl: profile.coverUrl,
      logoUrl: profile.logoUrl,
      teamSize: profile.teamSize,
      verified: profile.verified,
      services: profile.services,
      city: profile.location?.city,
      state: profile.location?.state,
      activeJobs: profile._count.jobs,
      followerCount: profile._count.followers,
      listings: profile.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        schedule: j.schedule
          ?.split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        compensation: formatComp(j),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

function formatComp(job: any): string {
  const { compModel, payMin, payMax, payUnit } = job;
  if (compModel === "commission") {
    if (payMin) return `${payMin}% Commission`;
    return "Commission";
  }
  if (compModel === "booth_rent") {
    if (payMin) return `$${payMin}${payUnit || "/wk"}`;
    return "Booth Rent";
  }
  if (payMin && payMax && Number(payMin) !== Number(payMax))
    return `$${payMin}-$${payMax}/hr`;
  if (payMin) return `$${payMin}/hr`;
  return "Hourly";
}
