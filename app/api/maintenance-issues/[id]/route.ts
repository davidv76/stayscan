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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { title, issue, status, details } = body

    // Fetch the existing issue and check ownership in a single query
    const existingIssue = await retryOperation(() =>
      prisma.maintenanceIssue.findFirst({
        where: {
          id,
          property: {
            userId
          }
        },
        select: {
          id: true
        }
      })
    )

    if (!existingIssue) {
      return NextResponse.json({ error: 'Maintenance issue not found or unauthorized' }, { status: 404 })
    }

    const updatedIssue = await retryOperation(() =>
      prisma.maintenanceIssue.update({
        where: { id },
        data: { title, issue, status, details },
        select: {
          id: true,
          title: true,
          issue: true,
          status: true,
          details: true,
          updatedAt: true
        }
      })
    )

    return NextResponse.json(updatedIssue)
  } catch (error) {
    return handleError(error, 'Failed to update maintenance issue')
  }
}

export const runtime = 'edge'