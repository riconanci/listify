import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { blockUserSchema } from "@/lib/validation";

// POST /api/users/block — Block a user (employer only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "employer") {
      return NextResponse.json(
        { error: "Only scouts can block users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = blockUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { blockedId, reason } = parsed.data;

    // Create block record
    await prisma.blockedUser.create({
      data: {
        blockerId: user.id,
        blockedId,
        reason,
      },
    });

    // Delete all inquiries from this user on employer's jobs
    const employerJobs = await prisma.job.findMany({
      where: { employerProfile: { userId: user.id } },
      select: { id: true },
    });

    const jobIds = employerJobs.map((j) => j.id);

    if (jobIds.length > 0) {
      // Delete starred inquiries first
      await prisma.starredInquiry.deleteMany({
        where: {
          inquiry: {
            senderId: blockedId,
            jobId: { in: jobIds },
          },
        },
      });

      await prisma.inquiry.deleteMany({
        where: {
          senderId: blockedId,
          jobId: { in: jobIds },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "User is already blocked" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to block user" },
      { status: 500 }
    );
  }
}

// GET /api/users/block — List blocked users
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: user.id },
      include: {
        blocked: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blocked);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch blocked users" },
      { status: 500 }
    );
  }
}
