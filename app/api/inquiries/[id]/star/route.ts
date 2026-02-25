import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

// POST /api/inquiries/[id]/star — Toggle star on inquiry
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check inquiry exists and belongs to employer's job
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        job: { include: { employerProfile: true } },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    if (inquiry.job.employerProfile.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Toggle: check if already starred
    const existing = await prisma.starredInquiry.findUnique({
      where: {
        userId_inquiryId: {
          userId: user.id,
          inquiryId: id,
        },
      },
    });

    if (existing) {
      await prisma.starredInquiry.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ starred: false });
    } else {
      await prisma.starredInquiry.create({
        data: {
          userId: user.id,
          inquiryId: id,
        },
      });
      return NextResponse.json({ starred: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to toggle star" },
      { status: 500 }
    );
  }
}
