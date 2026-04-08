import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createInquirySchema } from "@/lib/validation";

// GET /api/inbox/enquiries — List inquiries (role-aware)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "employer") {
      // Scout view: inquiries received on their jobs
      const inquiries = await prisma.inquiry.findMany({
        where: {
          job: {
            employerProfile: { userId: user.id },
          },
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          job: {
            select: {
              id: true,
              title: true,
              businessName: true,
              specialties: true,
              location: { select: { city: true, state: true } },
            },
          },
          stars: {
            where: { userId: user.id },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(inquiries);
    } else {
      // Talent view: inquiries they sent
      const inquiries = await prisma.inquiry.findMany({
        where: { senderId: user.id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              businessName: true,
              specialties: true,
              location: { select: { city: true, state: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(inquiries);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST /api/inbox/enquiries — Send an inquiry (talent → scout)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createInquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { jobId, phone, note, instagram } = parsed.data;

    // Check job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employerProfile: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user is blocked
    const blocked = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: job.employerProfile.userId,
          blockedId: user.id,
        },
      },
    });

    if (blocked) {
      return NextResponse.json(
        { error: "Unable to send inquiry to this listing" },
        { status: 403 }
      );
    }

    // Create inquiry (unique constraint will handle duplicates)
    const inquiry = await prisma.inquiry.create({
      data: {
        senderId: user.id,
        jobId,
        name: user.name,
        phone: phone || null,
        note: note || null,
        instagram: instagram || null,
      },
    });

    // Increment inquiry count
    await prisma.job.update({
      where: { id: jobId },
      data: { inquiriesCount: { increment: 1 } },
    }).catch(() => {});

    // Create notification for employer
    await prisma.notification.create({
      data: {
        userId: job.employerProfile.userId,
        type: "inquiry",
        title: "New Inquiry",
        body: `${user.name || "Someone"} sent an inquiry about "${job.title}"`,
        linkUrl: `/inbox`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error: any) {
    // Unique constraint violation = already sent
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You've already sent an inquiry for this listing" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to send inquiry" },
      { status: 500 }
    );
  }
}
