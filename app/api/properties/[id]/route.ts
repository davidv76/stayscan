import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { Property, User } from '@prisma/client'

// Helper function to handle errors
const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  if (error instanceof Error) {
    return NextResponse.json({ error: `${message}: ${error.message}` }, { status: 500 })
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
      console.warn(`Retrying operation, attempt ${i + 1} of ${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  throw lastError
}

const processStringField = (field: unknown, fieldName: string, required: boolean = false): string | undefined => {
  if (typeof field === 'string') {
    return field;
  } else if (Array.isArray(field)) {
    const processed = field.filter(item => typeof item === 'string').join(', ');
    return processed || (required ? '' : undefined);
  } else if (field === null || field === undefined) {
    return required ? '' : undefined;
  } else {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

const processArrayField = (field: unknown, fieldName: string): string[] => {
  if (Array.isArray(field)) {
    return field.filter(item => typeof item === 'string');
  } else if (typeof field === 'string') {
    return [field];
  } else if (field === null || field === undefined) {
    return [];
  } else {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

type PropertyWithUser = Property & { user: User }

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const { userId } = getAuth(request);
    
    const propertyId = parseInt(params.id, 10)
    if (isNaN(propertyId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 })
    }

    const property = await retryOperation(() =>
      prisma.property.findUnique({
        where: { id: propertyId },
        include: { 
          user: { select: { id: true, clerkId: true } },
          maintenanceIssues: true
        },
      })
    ) as PropertyWithUser | null

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({...property, isAuth: userId && property.user.clerkId === userId});
  } catch (error) {
    return handleError(error, 'Failed to fetch property')
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

    const propertyId = parseInt(params.id, 10)
    if (isNaN(propertyId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'location']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const property = await retryOperation(() =>
      prisma.property.findUnique({
        where: { id: propertyId },
        include: { user: true },
      })
    ) as PropertyWithUser | null

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const wifiObj: {name: string; password: string} = body.wifi;
    const isWifi = wifiObj.name && wifiObj.password ? wifiObj :  null;

    if(!isWifi){
      throw new Error('Invalid wifi format');
    }
    const checkoutObj: {checkOutTime: string; instructions: string} = body.checkOutDay;
    const isCheckoutDay = checkoutObj.checkOutTime && checkoutObj.instructions ? checkoutObj :  null;

    if(!isWifi || !isCheckoutDay){
      throw new Error('Invalid format');
    }


    const updatedProperty = await retryOperation(() =>
      prisma.property.update({
        where: { id: propertyId },
        data: {
          name: processStringField(body.name, 'name', true) || undefined,
          location: processStringField(body.location, 'location', true) || undefined,
          description: processStringField(body.description, 'description'),
          status: processStringField(body.status, 'status'),
          rubbishAndBins: processStringField(body.rubbishAndBins, 'rubbishAndBins'),
          amenities: processStringField(body.amenities, 'amenities'),
          images: processArrayField(body.images, 'images'),
          houseRules: processStringField(body.houseRules, 'houseRules'),
          wifi:wifiObj,
          localFood: processStringField(body.localFood, 'localFood'),
          applianceGuides: processStringField(body.applianceGuides, 'applianceGuides'),
          checkOutDay: JSON.stringify({
            checkOutTime: checkoutObj.checkOutTime,
            instructions: checkoutObj.instructions,
          }),
          emergencyContact: processStringField(body.emergencyContact, 'emergencyContact'),
          nearbyPlaces: processStringField(body.nearbyPlaces, 'nearbyPlaces'),
          digitalGuide: processStringField(body.digitalGuide, 'digitalGuide'),
        },
      })
    )

    return NextResponse.json(updatedProperty)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return handleError(error, 'Failed to update property')
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

    const propertyId = parseInt(params.id, 10)
    if (isNaN(propertyId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 })
    }

    const property = await retryOperation(() =>
      prisma.property.findUnique({
        where: { id: propertyId },
        include: { user: true },
      })
    ) as PropertyWithUser | null

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await retryOperation(() =>
      prisma.property.delete({
        where: { id: propertyId },
      })
    )

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    return handleError(error, 'Failed to delete property')
  }
}

export const runtime = 'nodejs'