import { UIDataTypes, UIMessagePart, UITools } from "ai";
import z from "zod";

export const Role = z.enum(['user', 'assistant', 'system']);
export const Parts = z.array(z.custom<UIMessagePart<UIDataTypes, UITools>>());
export const Model = z.enum(['gemini-2.5-flash-lite', 'gemini-2.5-flash']).default('gemini-2.5-flash');
export const Temperature = z.number().min(0).max(2).default(0.7);
export const Task = z.enum(['chat', 'sentiment']).default('chat');
export const Messages = z.array(z.object({
    role: Role,
    parts: Parts,
    metadata: z.optional(z.object({
        model: Model,
        temperature: Temperature,
        task: Task,
    }))
}));

export const chatRequestSchema = z.object({
    messages: Messages,
});

export const sentimentSchema = z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
    keywords: z.array(z.string()),
    summary: z.string(),
});
