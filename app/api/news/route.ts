import { NextRequest, NextResponse } from 'next/server';


var axios = require("axios").default;
require('dotenv').config({ path: '.env.local' });

const NC_API_KEY = process.env.NC_API;

export async function POST(req: NextRequest){
    try{
      var options = {
        method: 'GET',
        url: 'https://api.newscatcherapi.com/v2/search',
        params: {q: 'Bitcoin', lang: 'en', sort_by: 'relevancy', page: '1'},
        headers: {
          'x-api-key': NC_API_KEY,
        }
      };

        const response = await axios.request(options);

        const data = await response.data;

        console.log(data);

        return new NextResponse(JSON.stringify({ message: 'Fetched successfully!', data }), {
            status: 200,
        });
    } catch(error){
        console.error('Error fetching news articles:', error);

        return new NextResponse(JSON.stringify({ error: 'Failed to fetch news articles' }), {
            status: 500,
        });
    }
}