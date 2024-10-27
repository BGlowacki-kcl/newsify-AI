import OpenAI from "openai";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

require('dotenv').config({ path: '.env.local' });

const systemPrompt = `Start arguing with the user about the current political situation of the world.`;

export async function POST(req: Request) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    })
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
            { role: "system", content: systemPrompt },
            ...data
        ],
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content){
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    })
    return new NextResponse(stream);
}