import { NextRequest, NextResponse } from "next/server";

require('dotenv').config({ path: '.env.local' });

interface Article {
    headline: {
        main: string;
    };
}

const NYT_API_KEY = process.env.NYT_API_KEY;
const nytApiUrl = new URL('https://api.nytimes.com/svc/search/v2/articlesearch.json');

//const nytApiUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&api-key=${NYT_API_KEY}`;

export async function POST(req: NextRequest){
    try{
        const params: Record<string, string> = { q: "election", 'api-key': NYT_API_KEY as string };
        Object.entries(params).forEach(([key, value]) => {
            nytApiUrl.searchParams.append(key, value);
        })

        const response = await fetch(nytApiUrl);

        if(!response.ok){
            console.error(`Network response was not ok: ${response.status}`);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log(data.response.docs);

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