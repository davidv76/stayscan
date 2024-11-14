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
    const { name, location, description, amenities, nearbyPlaces, rubbishAndBins, houseRules } = await request.json()

    const prompt = `Generate a compelling and concise description for a vacation rental property with the following details:
    Name: ${name}
    Location: ${location}
    Description: ${description}
    Amenities: ${amenities}
    Nearby Places: ${nearbyPlaces}
    House Rules: ${houseRules}
    Rubbish & Bins: ${rubbishAndBins}

The description should be welcoming, highlight the best features of the property, its location, and nearby attractions. 
It should entice potential guests and give them a clear idea of what to expect during their stay. Keep the tone warm and inviting, and limit the description to about 2-3 paragraphs.`
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedDescription = completion.choices[0].message.content?.trim()

    if (!generatedDescription) {
      throw new Error('Failed to generate guide')
    }

    return NextResponse.json({ generatedDescription })
  } catch (error) {
    console.error('Error generating guide:', error)
    return NextResponse.json({ error: 'Error generating guide' }, { status: 500 })
  }
}

export const runtime = 'nodejs'