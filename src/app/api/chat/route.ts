import { models } from "@/lib/ai/models";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { calculatorTool, searchTool, weatherTool } from "@/lib/ai/tools";
import { chatRequestSchema } from "@/types/chat";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { z } from 'zod';


export const runtime = 'edge';  // lower latency
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = chatRequestSchema.parse(body);
        const lastMessage = messages[messages.length - 1];
        let model: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' = "gemini-2.5-flash-lite";
        let temperature = 0.7;
        if (lastMessage.metadata) {
            ({ model, temperature } = lastMessage.metadata);
        }

        const result = streamText({
            model: models[model],
            tools: {
                weather: weatherTool,
                search: searchTool,
                calculator: calculatorTool,
            },
            stopWhen: stepCountIs(5),
            messages: await convertToModelMessages(messages),
            system: SYSTEM_PROMPT,
            temperature,
            maxOutputTokens: 4096,
            // signal for client disconnection
            abortSignal: req.signal,
            // analytics
            onFinish: async ({ text, usage }) => {
                console.log(`Complete: ${usage.totalTokens} tokens.`)
            }
        })

        return result.toUIMessageStreamResponse();

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Invalid request', details: error.issues }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}