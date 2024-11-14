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
    const { name, location } = await request.json()

    const prompt = `Generate detailed information for a vacation rental property with the following details:
    Name: ${name}
    Location: ${location}

    Please provide the following information:
    1. House Rules (3-5 rules)
    2. Nearby Places (3-5 attractions)
    3. Emergency Contact (a fictional phone number)
    4. Amenities (5-7 items)
    5. WiFi Information (network name and password)
    6. Local Food Recommendations (2-3 restaurants)
    7. Brief Appliance Guides (for 2-3 appliances)
    8. Check-out Day and Time
    9. Rubbish and Bins Information (collection days, recycling instructions)

    Format the response as a JSON object with the following keys: houseRules, nearbyPlaces, amenities, localFood, rubbishAndBins, checkOutDay.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0].message.content?.trim()

    if (!generatedContent) {
      throw new Error('Failed to generate property details')
    }

    const parsedContent = JSON.parse(generatedContent)

    return NextResponse.json(parsedContent)
  } catch (error) {
    console.error('Error generating property details:', error)
    return NextResponse.json({ error: 'Error generating property details' }, { status: 500 })
  }
}

export const runtime = 'nodejs'