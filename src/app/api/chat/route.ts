import { google } from "@ai-sdk/google";
import { type UIMessage, convertToModelMessages, streamText } from "ai";

export const runtime = 'edge';  // lower latency

export async function POST(req:Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const results = streamText({
        model: google("gemini-2.5-flash-lite"),
        messages: await convertToModelMessages(messages),
        system: `You are a helpful AI assistant. Be concise and clear.`,
    })

    return results.toUIMessageStreamResponse();
}