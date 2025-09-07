import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        role: validatedData.role,
        password: hashedPassword,
      }
    })

    // Create role-specific profile
    if (validatedData.role === 'TALENT') {
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          occupations: validatedData.occupations || [],
          bio: validatedData.bio,
        }
      })
    } else if (validatedData.role === 'SCOUT') {
      await prisma.scoutProfile.create({
        data: {
          userId: user.id,
          shopName: validatedData.shopName!,
          defaultAddress: validatedData.shopAddress,
          website: validatedData.website,
        }
      })
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}