import type { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const FILE_PATH_TITLES = path.join(process.cwd(), 'titles.txt')
    const titlesWords = fs.readFileSync(FILE_PATH_TITLES, 'utf-8')
      .split(/\s+/)
      .map(title => title.trim())
      .filter(title => title !== '' && title.length > 4)
    
    const wordCount: {[key: string]: number} = {}
    titlesWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    const wordCountArray = Object.entries(wordCount)
    const topWords = wordCountArray
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(entry => entry[0])

    console.log(topWords);

    return new Response(JSON.stringify(topWords), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
    } catch (error) {
      console.error('Failed to fetch hot words:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch hot words' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
}
