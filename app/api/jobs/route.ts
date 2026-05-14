import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createJobSchema, jobFiltersSchema } from "@/lib/validation";
import { haversineDistance } from "@/lib/utils";

// GET /api/jobs — List jobs with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const filters = jobFiltersSchema.parse(raw);

    // If manage=true, return employer's own jobs
    if (filters.manage === "true") {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const jobs = await prisma.job.findMany({
        where: {
          employerProfile: { userId: user.id },
        },
        include: {
          location: true,
          photos: { take: 1, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(jobs);
    }

    // Build where clause
    const where: any = {
      status: "active",
      AND: [
        // Only show non-expired listings
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      ],
    };

    // Industry filter
    if (filters.industry) {
      where.industry = filters.industry;
    }

    // Specialty filter — supports comma-separated values
    // Shows listings that include ANY of the selected specialties
    if (filters.specialty) {
      const specs = filters.specialty.split(",").filter(Boolean);
      if (specs.length > 0) {
        where.specialties = { hasSome: specs };
      }
    }

    if (filters.schedule) {
      where.schedule = filters.schedule;
    }
    if (filters.compModel) {
      where.compModel = filters.compModel;
    }
    if (filters.search) {
      where.AND.push({
        OR: [
          { businessName: { contains: filters.search, mode: "insensitive" } },
          { title: { contains: filters.search, mode: "insensitive" } },
        ],
      });
    }
    if (filters.city) {
      where.location = {
        city: { contains: filters.city, mode: "insensitive" },
      };
    }

    let jobs = await prisma.job.findMany({
      where,
      include: {
        location: true,
        photos: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply radius filter if lat/lng provided
    if (filters.lat && filters.lng && filters.radius) {
      jobs = jobs.filter((job) => {
        if (!job.location?.lat || !job.location?.lng) return true;
        const dist = haversineDistance(
          filters.lat!,
          filters.lng!,
          job.location.lat,
          job.location.lng
        );
        return dist <= filters.radius!;
      });
    }

    return NextResponse.json(jobs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs — Create a new listing
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "employer") {
      return NextResponse.json(
        { error: "Only scouts can post listings" },
        { status: 403 }
      );
    }

    // One-listing-per-account enforcement (free tier)
    // Check for active, non-expired listings
    const existingActive = await prisma.job.count({
      where: {
        employerProfile: { userId: user.id },
        status: "active",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (existingActive >= 1) {
      return NextResponse.json(
        { error: "Free accounts are limited to 1 active listing. Delete or let your current listing expire before posting a new one." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Get or create employer profile
    let profile = await prisma.employerProfile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.employerProfile.create({
        data: {
          userId: user.id,
          shopName: data.businessName,
        },
      });
    }

    // Create location if address/city/coordinates provided
    let locationId: string | null = null;
    if (data.address || data.city || data.lat) {
      const location = await prisma.location.create({
        data: {
          addressLine1: data.address,
          city: data.city,
          state: "CA",
          country: "US",
          lat: data.lat ?? undefined,
          lng: data.lng ?? undefined,
        },
      });
      locationId = location.id;
    }

    // Create job
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const job = await prisma.job.create({
      data: {
        employerProfileId: profile.id,
        businessName: data.businessName,
        title: data.title,
        industry: data.industry as any,
        specialties: data.specialties as any,
        compModel: data.compModel as any,
        payMin: data.payMin,
        payMax: data.payMax,
        payUnit: data.payUnit,
        payVisible: data.payVisible,
        employmentType: data.employmentType as any,
        schedule: data.schedule as any,
        experienceText: data.experienceText,
        description: data.description,
        locationId,
        expiresAt,
      },
    });

    // Save photo if provided
    if (data.photo) {
      await prisma.jobPhoto.create({
        data: {
          jobId: job.id,
          url: data.photo,
        },
      });
    }

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
