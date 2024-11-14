import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
      include: { properties: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const propertyIds = user.properties.map((property) => property.id)

    const maintenanceIssues = await prisma.maintenanceIssue.findMany({
      where: {
        propertyId: { in: propertyIds },
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ maintenanceIssues })
  } catch (error) {
    console.error('Error fetching maintenance issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance issues', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, title, issue, priority } = body

    if (!propertyId || !title || !issue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
      include: { properties: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const property = user.properties.find((p) => p.id === propertyId)
    if (!property) {
      return NextResponse.json({ error: 'Property not found or not owned by user' }, { status: 404 })
    }

    const newMaintenanceIssue = await prisma.maintenanceIssue.create({
      data: {
        propertyId,
        title,
        issue,
        status: 'Open', // This matches the default in your schema
        details: priority, // Assuming you want to use 'priority' as 'details'
      },
    })

    return NextResponse.json({ maintenanceIssue: newMaintenanceIssue })
  } catch (error) {
    console.error('Error creating maintenance issue:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance issue', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export const runtime = "edge"