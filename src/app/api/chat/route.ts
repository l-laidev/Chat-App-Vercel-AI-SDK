import { models } from "@/lib/ai/models";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { type UIMessagePart, UIDataTypes, type UITools, convertToModelMessages, streamText } from "ai";
import { z } from 'zod';


export const runtime = 'edge';  // lower latency
export const maxDuration = 30;

const chatRequestSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        text: z.string(),
        parts: z.array(z.custom<UIMessagePart<UIDataTypes, UITools>>()),
    })),
    model: z.enum(['gemini-2.5-flash-lite', 'gemini-2.5-flash']).default('gemini-2.5-flash'),
    temperature: z.number().min(0).max(2).default(0.7),
});

export async function POST(req:Request) {
    try {
        const body = await req.json();
        const { messages, model, temperature } = chatRequestSchema.parse(body);
        
        const result = streamText({
            model: models[model],
            messages: await convertToModelMessages(messages),
            system: SYSTEM_PROMPT,
            temperature,
            maxOutputTokens: 4096,
            // signal for client disconnection
            abortSignal: req.signal,
            // analytics
            onFinish: async ({text, usage}) => {
                console.log(`Complete: ${usage.totalTokens} tokens.`)
            }
        })

        return result.toUIMessageStreamResponse();

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({error: 'Invalid request', details: error.issues}), {
                status: 400,
                headers: {'Content-Type': 'application/json'},
            });
        }

        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({error: 'Internal server error'}), {
            status: 500,
            headers: {'Content-Type': 'application/json'},
        });
    }
}