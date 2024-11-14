import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const data = await request.json()
    
    // Handle optional fields from Prisma schema with default values
    const propertyData = {
      name: data.name || 'Property',
      rubbishAndBins: data.rubbishAndBins || 'Rubbish And Bins',
      location: data.location || 'Location not specified',
      description: data.description || 'No description available',
      wifi: data.wifi || 'WiFi information not available',
      amenities: data.amenities || 'No amenities listed',
      nearbyPlaces: data.nearbyPlaces || 'No nearby places listed',
      houseRules: data.houseRules || 'Standard house rules apply',
      localFood: data.localFood || 'Local dining information not available',
      applianceGuides: data.applianceGuides || 'applianceGuides',
      emergencyContact: data.emergencyContact || 'Emergency contact information not available'
    }

    const prompt = `Generate a detailed digital guide for a vacation rental property. Include ALL of the following sections:

# ${propertyData.name} - Digital Guide

## Location Information
- Address: ${propertyData.location}
- Nearby Attractions: ${propertyData.nearbyPlaces}

## Amenities & Features
${propertyData.amenities}

## Internet Access
${propertyData.wifi}

## Appliance Guide
${propertyData.applianceGuides}

## House Rules
${propertyData.houseRules}

## Rubbish And Bins
${propertyData.rubbishAndBins}

## Local Dining Guide
${propertyData.localFood}

## Emergency Information
${propertyData.emergencyContact}

Please format this guide with clear sections and bullet points where appropriate. Ensure all provided information is included in an organized, easy-to-read format.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional property guide writer. Create clear, well-structured guides that are easy to read and understand."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const generatedGuide = completion.choices[0].message.content?.trim()

    if (!generatedGuide) {
      throw new Error('Failed to generate guide')
    }

    return NextResponse.json({ generatedGuide })
  } catch (error) {
    console.error('Error generating guide:', error)
    return NextResponse.json({ error: 'Error generating guide' }, { status: 500 })
  }
}

export const runtime = 'nodejs'