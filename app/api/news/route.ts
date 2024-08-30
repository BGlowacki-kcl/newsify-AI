import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { EventRegistry, QueryArticles, RequestArticlesInfo } from 'eventregistry';

const FILE_PATH = path.join(process.cwd(), 'news_articles.txt');
const FILE_PATH_TITLES = path.join(process.cwd(), 'titles.txt');

require('dotenv').config({ path: '.env.local' });

const NEWS_API_KEY = process.env.NEWS_API_KEY;

async function fetchAndStoreNewsArticles() {
    const er = new EventRegistry({ apiKey: NEWS_API_KEY, allowUseOfArchive: false });

    const requestArticlesInfo = new RequestArticlesInfo({ count: 100, sortBy: "date", sortByAsc: false });
    const q1 = new QueryArticles({
        sourceLocationUri: [
            "http://en.wikipedia.org/wiki/United_Kingdom",
        ],
        ignoreSourceGroupUri: "paywall/paywalled_sources",
    });
    q1.setRequestedResult(requestArticlesInfo);

    try {
        const response = await er.execQuery(q1);
        let allArticles = '';
        let allTitles = '';

        const results = response.articles.results as Array<any>;

    results.forEach((article: any) => {
        if (!allArticles.includes(article.title)){
            const cleanBody = article.body.replace(/\s+/g, ' ').trim();
            allArticles += `
                Title: ${article.title}; date: ${article.date}; URL: ${article.url}; type: ${article.dataType}; Description: ${cleanBody};
            `;
            allTitles += `
                ${article.title}
            `;
        }
    });
        fs.writeFileSync(FILE_PATH, allArticles, { encoding: 'utf-8' });
        fs.writeFileSync(FILE_PATH_TITLES, allTitles, { encoding: 'utf-8' });

        return { message: 'News articles have been successfully fetched and stored.' };
    } catch (error) {
        console.error('Error fetching news articles:', error);
        return { error: 'Failed to fetch news articles.' };
    }
}

export async function POST(req: NextRequest) {
    const result = await fetchAndStoreNewsArticles();
    if (result.error) {
        return NextResponse.json(result, { status: 500 });
    } else {
        return NextResponse.json(result, { status: 200 });
    }    
}
