import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Helper function to handle errors
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json({ error: 'A unique constraint violation occurred.' }, { status: 409 })
      case 'P2025':
        return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
      default:
        return NextResponse.json({ error: 'An unexpected database error occurred.' }, { status: 500 })
    }
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

// Helper function to retry database operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: unknown
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2024' || error.message.includes('prepared statement'))) {
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
  throw lastError
}

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const maintenanceIssues = await retryOperation(() =>
      prisma.maintenanceIssue.findMany({
        where: { property: { user: { clerkId: userId } } },
        select: {
          id: true,
          title: true,
          issue: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    )

    return NextResponse.json(maintenanceIssues)
  } catch (error) {
    return handleError(error, 'Failed to fetch maintenance issues')
  }
}

export async function POST(request: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { propertyId, issue, status, title } = body

    if (!propertyId || !issue || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const maintenanceIssue = await retryOperation(() =>
      prisma.maintenanceIssue.create({
        data: {
          title,
          issue,
          status: status || 'Open',
          property: {
            connect: {
              id: parseInt(propertyId),
              user: {
                clerkId: userId,
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
          issue: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    )

    return NextResponse.json(maintenanceIssue)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Property not found or does not belong to user' }, { status: 404 })
    }
    return handleError(error, 'Failed to create maintenance issue')
  }
}

export async function PUT(request: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, issue, status } = body

    if (!id || (!title && !issue && !status)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updatedMaintenanceIssue = await retryOperation(() =>
      prisma.maintenanceIssue.update({
        where: {
          id: parseInt(id),
          property: {
            user: {
              clerkId: userId,
            },
          },
        },
        data: {
          ...(title && { title }),
          ...(issue && { issue }),
          ...(status && { status }),
        },
        select: {
          id: true,
          title: true,
          issue: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          property: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    )

    return NextResponse.json(updatedMaintenanceIssue)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Maintenance issue not found or does not belong to user' }, { status: 404 })
    }
    return handleError(error, 'Failed to update maintenance issue')
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing maintenance issue ID' }, { status: 400 })
    }

    await retryOperation(() =>
      prisma.maintenanceIssue.delete({
        where: {
          id: parseInt(id),
          property: {
            user: {
              clerkId: userId,
            },
          },
        },
      })
    )

    return NextResponse.json({ message: 'Maintenance issue deleted successfully' })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Maintenance issue not found or does not belong to user' }, { status: 404 })
    }
    return handleError(error, 'Failed to delete maintenance issue')
  }
}

export const runtime = 'edge';