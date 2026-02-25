import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateJobStatusSchema } from "@/lib/validation";

interface RouteContext {
  params: { id: string };
}

// GET /api/jobs/[id] — Get single job
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        location: true,
        photos: { orderBy: { sortOrder: "asc" } },
        employerProfile: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] — Delete listing (owner only)
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: { employerProfile: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (job.employerProfile.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete related records first
    await prisma.jobPhoto.deleteMany({ where: { jobId: id } });
    await prisma.starredInquiry.deleteMany({
      where: { inquiry: { jobId: id } },
    });
    await prisma.inquiry.deleteMany({ where: { jobId: id } });
    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] — Update listing status or renew
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateJobStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { employerProfile: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (job.employerProfile.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle renew action — reset expiry and reactivate
    if (parsed.data.action === "renew") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const updated = await prisma.job.update({
        where: { id },
        data: { status: "active", expiresAt },
      });

      return NextResponse.json({ success: true, job: updated });
    }

    // Handle status change
    if (parsed.data.status) {
      const updated = await prisma.job.update({
        where: { id },
        data: { status: parsed.data.status },
      });

      return NextResponse.json({ success: true, job: updated });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 500 }
    );
  }
}
