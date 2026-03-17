import { UIDataTypes, UIMessagePart, UITools } from "ai";
import z from "zod";

export const chatRequestSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        parts: z.array(z.custom<UIMessagePart<UIDataTypes, UITools>>()),
        metadata: z.optional(z.object({
            model: z.enum(['gemini-2.5-flash-lite', 'gemini-2.5-flash']).default('gemini-2.5-flash'),
            temperature: z.number().min(0).max(2).default(0.7),
        }))
    })),
});