import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const response = await fetch('https://your-api-endpoint.com/api/news', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new NextResponse(
        JSON.stringify({ error: errorData.error || 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new NextResponse(
      JSON.stringify({ message: data.message || 'No message received.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: `Failed to fetch news articles. Error -> ${(error as Error).message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(
    JSON.stringify({ error: 'Method OPTIONS Not Allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
}
