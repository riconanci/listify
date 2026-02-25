// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Validation schema for profile updates
const zProfileUpdate = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(20, "Name must be 20 characters or less")
    .regex(/^[a-zA-Z0-9\s._-]+$/, "Name can only contain letters, numbers, spaces, dots, underscores, and hyphens")
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, "Name cannot be empty after trimming"),
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // 3. Validate input
    const validation = zProfileUpdate.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: errors 
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // 4. Check if name is actually changing
    if (me.name === name) {
      return NextResponse.json(
        { error: "No changes detected" },
        { status: 400 }
      );
    }

    // 5. Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: me.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // 6. Return success response
    return NextResponse.json({ 
      ok: true,
      message: "Profile updated successfully",
      user: updatedUser 
    });

  } catch (err: any) {
    console.error("Profile update error:", err);
    
    // Handle Prisma/database errors
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A conflict occurred while updating your profile" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}