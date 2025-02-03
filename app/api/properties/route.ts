import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import prisma from '@/lib/prisma'
import { Prisma, User as PrismaUser } from '@prisma/client'

const handleError = (error: unknown, message: string) => {
  console.error(`${message}:`, error)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: `Prisma error: ${error.message}`, code: error.code }, { status: 400 })
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return NextResponse.json({ error: `Unknown Prisma error: ${error.message}` }, { status: 500 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}

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
        console.warn(`Retrying operation, attempt ${i + 1} of ${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
  throw lastError
}

const checkAuth = (handler: (userId: string, request: NextRequest) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    const { userId } = auth()
    if (!userId) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(userId, request)
  }
}

const getUserByClerkId = async (clerkId: string): Promise<PrismaUser> => {
  const user = await retryOperation(() =>
    prisma.user.findUnique({
      where: { clerkId },
    })
  );
  if (!user) {
    console.log(`User not found for Clerk ID ${clerkId}`);
    throw new Error('User not found');
  }
  return user;
};

const processStringField = (field: unknown, fieldName: string, required: boolean = false): string | null => {
  if (typeof field === 'string') {
    return field
  }else if (Array.isArray(field)) {
    const processed = field.filter(item => typeof item === 'string').join(', ')
    return processed || (required ? '' : null)
  } else if (field === null || field === undefined) {
    return required ? '' : null
  } else {
    throw new Error(`Invalid ${fieldName} format`)
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
};

export const GET = checkAuth(async (userId: string) => {
  try {
    const user = await getUserByClerkId(userId);
    const properties = await retryOperation(() =>
      prisma.property.findMany({
        where: { userId: user.id },
      })
    );
    return NextResponse.json(properties);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return handleError(error, 'Failed to fetch properties');
  }
});

export const POST = checkAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      name, 
      location, 
      description, 
      status, 
      amenities, 
      images, 
      localFood,
      rubbishAndBins,
      wifi,
      applianceGuides,
      houseRules,
      checkOutDay, 
      emergencyContact, 
      nearbyPlaces,
      digitalGuide
    } = body

    const requiredFields = ['name', 'location']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const wifiObj: {name: string; password: string} = wifi;
    const isWifi = wifiObj.name && wifiObj.password ? wifiObj :  null;
    
    const checkoutObj: {checkOutTime: string; instructions: string} = checkOutDay;
    const isCheckoutDay = checkoutObj.checkOutTime && checkoutObj.instructions ? checkoutObj :  null;

    if(!isWifi){
      throw new Error('Invalid wifi format');
    }

    if(!isCheckoutDay){
      throw new Error('Invalid checkout format');
    }

    const user = await getUserByClerkId(userId);

    const newProperty = await retryOperation(() =>
      prisma.property.create({
        data: {
          name: processStringField(name, 'name', true) || '',
          location: processStringField(location, 'location', true) || '',
          description: processStringField(description, 'description'),
          status: processStringField(status, 'status'),
          rubbishAndBins: processStringField(rubbishAndBins, 'rubbishAndBins'),
          amenities: processStringField(amenities, 'amenities'),
          images: processArrayField(images, 'images'),
          localFood: processStringField(localFood, 'localFood'),
          wifi: wifiObj,
          applianceGuides: processStringField(applianceGuides, 'applianceGuides'),
          houseRules: processStringField(houseRules, 'houseRules'),
          checkOutDay: JSON.stringify({
            checkOutTime: body.checkOutTime,
            instructions: body.instructions,
          }),
          emergencyContact: processStringField(emergencyContact, 'emergencyContact'),
          nearbyPlaces: processStringField(nearbyPlaces, 'nearbyPlaces'),
          digitalGuide: processStringField(digitalGuide, 'digitalGuide'),
          userId: user.id,
        },
      })
    )

    console.log(`Successfully created property for user ${userId}`)
    return NextResponse.json(newProperty, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return handleError(error, 'Error creating property')
  }
})

export const runtime = 'nodejs'