import OpenAI from "openai"
import {NextResponse} from 'next/server'
import path from "path";
import fs from "fs";

require('dotenv').config({ path: '.env.local' });

const FILE_PATH = path.join(process.cwd(), 'news_articles.txt');
const articles = fs.readFileSync(FILE_PATH, 'utf-8').split('\n');

const FILE_PATH_TITLES = path.join(process.cwd(), 'titles.txt');
const titles = fs.readFileSync(FILE_PATH_TITLES, 'utf-8').split('\n').map(title => title.trim()).filter(title => title != '');

var augmentedPrompt = `;
const systemPrompt = Act like a journalist. Be very specific and speak in the scientific language. 
Here you have some articles that will help you answer the questins. These are newest articles, answer questins according to them.

Here are some rules:
-Include quotes, authors (if applicable), dates and urls,
-If you can't find exact answer in articels provided, force at least one up-to-date article from below,
-Respond with as many details as you can and ask if a user needs more information about any of the topics,
-Include numbers if provided in the articles, 
-Don't use shortcuts like XYZ, explain everything,

Keep answers short. Write more if someone got interested in the topic.

Use this data. If there is not enough articles, use your own. Point out that your articles are not up to date.

Here are all the articles:
`

function getMatchingScore(title: string, userMessageWords: string[]): number {
  const titleWords = title.toLowerCase().split(/\s+/); // Split title into words
  let matchCount = 0;

  userMessageWords.forEach(word => {
      if (titleWords.includes(word)) {
          matchCount++;
      }
  });

  return matchCount;
}

function getRandomArticle(articles: any[], titles: any[]): any {
  const randomIndex = Math.floor(Math.random() * titles.length);
  var oneTitle = titles[randomIndex];
  return articles.filter(article => article.includes(oneTitle))[0];
}

function getAugmentedPrompt(data: any): string {
  const userMessage = data[data.length-1]?.content || "";
    const userMessageWords = userMessage.toLowerCase().split(/\s+/).filter((word: string) => word && !['I', 'want', 'to', 'show', 'tell', 'me', 'how', 'many', 'much', 'hi', 'hello', 'why', 'when'].includes(word));
    console.log(userMessage)
    console.log("Titles length: " + titles.length);
    const titleScores = titles.map(title => ({
      title,
      score: getMatchingScore(title, userMessageWords),
    }));
    const bestMatches = titleScores.filter(titleScore => titleScore.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    console.log(bestMatches.map(bestMatch => bestMatch.title))
    const selectedArticles = articles.filter(article => 
      bestMatches.some(bestMatch => article.includes(bestMatch.title))
    );
    console.log('Articles: ' + selectedArticles.length)
    

    while (selectedArticles.length < 4) {
      const randomArticle = getRandomArticle(articles, titles);
      if (!selectedArticles.some(article => article === randomArticle)) {
          selectedArticles.push(randomArticle);
      }
    }
    console.log(selectedArticles)
    console.log(selectedArticles.length)
    return `
      ${augmentedPrompt}
      ${selectedArticles}
    `
}

export async function POST(req: Request) {
  console.log("In POST")
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    }) 
    const data = await req.json()

    if(data.length == 2){
      augmentedPrompt = getAugmentedPrompt(data)
    }
    
    const completion = await openai.chat.completions.create({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: augmentedPrompt },
          ...data
        ],
        stream: true,
      })

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
          try {
            // Iterate over the streamed chunks of the response
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
              if (content) {
                const text = encoder.encode(content) // Encode the content to Uint8Array
                controller.enqueue(text) // Enqueue the encoded text to the stream
              }
            }
          } catch (err) {
            controller.error(err) // Handle any errors that occur during streaming
          } finally {
            controller.close() // Close the stream when done
          }
        },
      })
    
      return new NextResponse(stream)
}