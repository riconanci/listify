import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        talentProfile: true,
        scoutProfile: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update user basic info
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.avatarUrl) updateData.avatarUrl = body.avatarUrl

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })

    // Update role-specific profile
    if (session.user.role === 'TALENT' && body.talentProfile) {
      await prisma.talentProfile.upsert({
        where: { userId: session.user.id },
        update: {
          occupations: body.talentProfile.occupations || [],
          bio: body.talentProfile.bio,
        },
        create: {
          userId: session.user.id,
          occupations: body.talentProfile.occupations || [],
          bio: body.talentProfile.bio,
        }
      })
    }

    if (session.user.role === 'SCOUT' && body.scoutProfile) {
      await prisma.scoutProfile.upsert({
        where: { userId: session.user.id },
        update: {
          shopName: body.scoutProfile.shopName,
          defaultAddress: body.scoutProfile.defaultAddress,
          website: body.scoutProfile.website,
        },
        create: {
          userId: session.user.id,
          shopName: body.scoutProfile.shopName,
          defaultAddress: body.scoutProfile.defaultAddress,
          website: body.scoutProfile.website,
        }
      })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}