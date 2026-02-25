import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

// DELETE /api/inquiries/[id] — Delete/withdraw inquiry
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        job: {
          include: { employerProfile: true },
        },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Check authorization: sender can withdraw, employer can delete
    const isSender = inquiry.senderId === user.id;
    const isEmployer = inquiry.job.employerProfile.userId === user.id;

    if (!isSender && !isEmployer) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete starred records first
    await prisma.starredInquiry.deleteMany({
      where: { inquiryId: id },
    });

    await prisma.inquiry.delete({ where: { id } });

    // Decrement inquiry count
    await prisma.job.update({
      where: { id: inquiry.jobId },
      data: { inquiriesCount: { decrement: 1 } },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
