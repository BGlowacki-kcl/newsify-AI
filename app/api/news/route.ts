// import type { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs';
// import path from 'path';
// import { EventRegistry, QueryArticles, RequestArticlesInfo } from 'eventregistry';

// const FILE_PATH = path.join(process.cwd(), 'news_articles.txt');

// require('dotenv').config({ path: '.env.local' });

// const NEWS_API_KEY = process.env.NEWS_API_KEY;

// async function fetchAndStoreNewsArticles() {
//     const er = new EventRegistry({ apiKey: NEWS_API_KEY, allowUseOfArchive: false });

//     const requestArticlesInfo = new RequestArticlesInfo({ count: 100, sortBy: "date", sortByAsc: false });
//     const q1 = new QueryArticles({
//         sourceLocationUri: [
//             "http://en.wikipedia.org/wiki/United_Kingdom",
//         ],
//         ignoreSourceGroupUri: "paywall/paywalled_sources",
//     });
//     q1.setRequestedResult(requestArticlesInfo);

//     try {
//         const response = await er.execQuery(q1);
//         let allArticles = '';

//         response.articles.results.forEach((article: any) => {
//             allArticles += `
//                 Title: ${article.title}
//                 Source: ${article.source.title}
//                 Date: ${article.date}
//                 URL: ${article.url}
//                 Content: ${article.body || 'No content available'}
                
//             `;
//         });

//         fs.writeFileSync(FILE_PATH, allArticles, { encoding: 'utf-8' });

//         return { message: 'News articles have been successfully fetched and stored.' };
//     } catch (error) {
//         console.error('Error fetching news articles:', error);
//         return { error: 'Failed to fetch news articles.' };
//     }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'POST') {
//         const result = await fetchAndStoreNewsArticles();
//         if (result.error) {
//             res.status(500).json(result);
//         } else {
//             res.status(200).json(result);
//         }
//     } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }
