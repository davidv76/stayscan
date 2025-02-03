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


    const prompt = `
      Generate detailed information for a vacation rental property with the following details:

      Name: ${name}
      Location: ${location}
      Please adhere to the following instructions strictly:

      1. Always return the response as a JSON object with these exact property names and structure:

      - houseRules (Array of 3-5 strings of rules)
      - nearbyPlaces (Array of 3-5 strings of attractions with names and distances in km)
      - emergencyContact (A fictional phone number as a string)
      - amenities (Array of 5-7 strings of items)
      - WiFiInformation (An object with networkName and password as strings)
      - localFood (Array of objects of 3-5 restaurants, each with restaurantName, distance in km, and websiteUrl)
      - applianceGuides (Array of 2-3 strings explaining appliance usage)
      - checkOutDay (An object with two property of string (e.g: checkOutTime, instructions))
      - rubbishAndBins (Array of 2-3 strings about trash collection and recycling instructions)

      2. Ensure the structure is always the same, with no missing or additional keys.
    `

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

    const parsedContent = JSON.parse(generatedContent);

    return NextResponse.json(parsedContent)
  } catch (error: any) {
    console.error('Error generating property details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 429 })
  }
}

export const runtime = 'nodejs'