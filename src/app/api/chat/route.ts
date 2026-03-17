import { models } from "@/lib/ai/models";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { calculatorTool, searchTool, weatherTool } from "@/lib/ai/tools";
import { getCache, setCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rate-limit";
import { chatRequestSchema, sentimentSchema } from "@/types/chat";
import { AISDKError, APICallError, convertToModelMessages, LoadAPIKeyError, Output, RetryError, simulateReadableStream, stepCountIs, streamText } from "ai";
import { z } from 'zod';


export const runtime = 'edge';  // lower latency
export const maxDuration = 30;


function parseBody(body: any) {
    const { messages } = chatRequestSchema.parse(body);
    const lastMessage = messages[messages.length - 1];
    let model: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' = "gemini-2.5-flash-lite";
    let temperature = 0.7;
    let task: 'chat' | 'sentiment' = 'chat';
    if (lastMessage.metadata) {
        ({ model, temperature, task } = lastMessage.metadata);
    }

    return { messages, model, temperature, task };
}

async function checkRateLimit(req: Request) {
    const ip = req.headers.get('x-forward-for') ?? 'anonymous';
    const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

    if (!success) {
        return new Response('Rate limit exceeded', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
            }
        });
    }

    return null;
}

function responseFromCached(cached: string, numMessages: number) {
    return new Response(
        simulateReadableStream({
            initialDelayInMs: 1000,
            chunkDelayInMs: 300,
            chunks: [
                `data: {"type":"start","messageId":"cached-msg-${numMessages}"}\n\n`,
                `data: {"type":"text-start","id":"text-1"}\n\n`,
                `data: {"type":"text-delta","id":"text-1","delta":"${cached}"}\n\n`,
                `data: {"type":"text-end","id":"text-1"}\n\n`,
                `data: {"type":"finish"}\n\n`,
                `data: [DONE]\n\n`,
            ]
        }).pipeThrough(new TextEncoderStream()),
        {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'x-vercel-ai-ui-message-stream': 'v1',
            }
        }
    );
}

export async function POST(req: Request) {
    try {
        const rateCheck = await checkRateLimit(req);
        if (rateCheck != null) {
            return rateCheck;
        }

        const body = await req.json();
        const { messages, model, temperature, task } = parseBody(body);

        const lastMessagePart = messages.at(-1)?.parts.at(-1);

        if (lastMessagePart?.type == 'text') {
            const cached = await getCache(lastMessagePart.text);
            if (cached) {
                return responseFromCached(cached, messages.length);
            }
        }
        console.log('Generating text...');

        const result = streamText({
            model: models[model],
            tools: task == 'sentiment' ? undefined : {
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

                if (lastMessagePart?.type == 'text') {
                    await setCache(lastMessagePart.text, text);
                }
            },
            output: task == "chat" ? Output.text() : Output.object({ schema: sentimentSchema }),
        })

        return result.toUIMessageStreamResponse();

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Invalid Request', details: error.issues }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (error instanceof AISDKError) {
            console.error(`Error type: ${typeof error}`);
            console.error(`Chat API Error "${error.name}": ${error.message}`);
            switch (typeof error) {
                case typeof APICallError:
                case typeof RetryError:
                    return new Response(JSON.stringify({ error: "Rate Limit Exceeded", message: "Please wait a moment before trying again.", retryAfter: 60 }),
                        { status: 429 })
                case typeof LoadAPIKeyError:
                    return new Response(JSON.stringify({ error: "Configuration Error", message: "AI Service temporarilty unavailable." }),
                        { status: 503 })
                default:
                    return new Response(JSON.stringify({ error: "AI Error", message: error.message }),
                        { status: 500 })
            }
        }

        return new Response(JSON.stringify({ error: 'Internal Server Rrror' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}