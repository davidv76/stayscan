import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleApiKey = 'AIzaSyDLnq3t-wq49qTYctwagsFU5LoLs05rxYs';

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  try {
    const { name, location } = await request.json()



    const attractions = await findAttractions(location);

    const restaurants = await findRestaurants(location);

    const  restaurantsData = await restaurants.json();


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
      - checkOutDay (An object with two property of string (e.g: checkOutTime: sunday 10PM, instructions))
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

    parsedContent.localFood = restaurantsData;
    parsedContent.nearbyPlaces = attractions;

    return NextResponse.json(parsedContent)
  } catch (error: any) {
    console.error('Error generating property details:', error.message);
    return NextResponse.json({ error: error.message }, { status: 429 })
  }
}




const findAttractions = async (location: string)=>  {
  try {


      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=tourist+attractions+in+${location}&key=${googleApiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      // Limit to 5 attractions
      const attractions = data.results.slice(0, 5).map((item: any)=> {
        return {
          name: item.name,
          address: item.formatted_address
        }
      });

      return attractions;
    
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

}


// Getting local restaurants function
const findRestaurants = async (location: string)=> {
  
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${location}&key=${googleApiKey}`;

  try {
    const response = await fetch(url);

    if(!response.ok){
      throw new Error("getting Restaurants failed!");
    }
    const data = await response.json();

    const textSearchResultData = data.results.slice(0, 5);

    if(textSearchResultData.length === 0){
      throw new Error('No restaurants found!');
    }



    const restaurantsWithDetails = await Promise.all(
      textSearchResultData.map(async (restaurant: any) => {
        const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,website,formatted_address,formatted_phone_number,editorial_summary,reviews&key=${googleApiKey}`;
        const placeDetailsResponse = await fetch(placeDetailsUrl);
        const placeDetailsData = await placeDetailsResponse.json();

        if (placeDetailsData.status === 'OK') {
          const details = placeDetailsData.result;

          return {
              restaurantName: restaurant.name,
              websiteUrl: details.website ?? 'N/A',
              phone: details.formatted_phone_number ?? 'N/A',
              address: details.formatted_address ?? 'N/A',
              description:
              details.editorial_summary?.overview ?? // Use editorial summary if available
              'No description available', // Default fallback
          };
        } else {
          throw new Error('Restaurant details not found!');
        }
      })
    );


  //   res.status(200).json(data.results);
  console.log('data: ', restaurantsWithDetails);
  return NextResponse.json(restaurantsWithDetails, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export const runtime = 'nodejs'