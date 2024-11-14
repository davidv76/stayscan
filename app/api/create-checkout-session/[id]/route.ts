import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { PrismaClient } from '@prisma/client/edge'

const prisma = new PrismaClient()

async function getUserProperty(userId: string, propertyId: number) {
  return await prisma.property.findFirst({
    where: {
      id: propertyId,
      userId,
    },
  })
}

async function getMaintenanceIssue(id: number) {
  return await prisma.maintenanceIssue.findUnique({
    where: { id },
    include: { property: true },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const maintenanceIssue = await getMaintenanceIssue(id)

    if (!maintenanceIssue) {
      return NextResponse.json({ error: 'Maintenance issue not found' }, { status: 404 })
    }

    const userProperty = await getUserProperty(userId, maintenanceIssue.propertyId)

    if (!userProperty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(maintenanceIssue)
  } catch (error) {
    console.error('Error fetching maintenance issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance issue' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, issue, status, details } = body

    const existingIssue = await getMaintenanceIssue(id)

    if (!existingIssue) {
      return NextResponse.json({ error: 'Maintenance issue not found' }, { status: 404 })
    }

    const userProperty = await getUserProperty(userId, existingIssue.propertyId)

    if (!userProperty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedIssue = await prisma.maintenanceIssue.update({
      where: { id },
      data: { title, issue, status, details },
    })

    return NextResponse.json(updatedIssue)
  } catch (error) {
    console.error('Error updating maintenance issue:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance issue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const existingIssue = await getMaintenanceIssue(id)

    if (!existingIssue) {
      return NextResponse.json({ error: 'Maintenance issue not found' }, { status: 404 })
    }

    const userProperty = await getUserProperty(userId, existingIssue.propertyId)

    if (!userProperty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.maintenanceIssue.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Maintenance issue deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance issue:', error)
    return NextResponse.json(
      { error: 'Failed to delete maintenance issue' },
      { status: 500 }
    )
  }
}

export const runtime = "edge"