import { tool } from "ai";
import z from "zod";


export const weatherTool = tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
        location: z.string().describe(`City name, e.g., "San Francisco"`),
        unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
    }),
    execute: async ({ location, unit }) => {
        // mock the tool
        const temp = Math.floor(Math.random() * 30) + 5;
        return {
            location,
            temperature: temp,
            unit,
            condition: "Partly cloudy",
        };
    },
});

export const searchTool = tool({
    description: "Search the web for current information",
    inputSchema: z.object({
        query: z.string().describe("The search query"),
    }),
    execute: async ({ query }) => {
        return {
            results: [
                { title: `(Mock) Results for: ${query}`, url: 'https://example.com' },
            ]
        }
    }
})

export const calculatorTool = tool({
    description: "Perform mathematical calculations",
    inputSchema: z.object({
        expression: z.string().describe(`Mathematical expression, e.g., "2 + 2 * 3"`),
    }),
    execute: async ({ expression }) => {
        try {
            const result = Function(`"use strict"; return (${expression})`)();
            return { expression, result };
        } catch {
            return { expression, error: "Invalid JavaScript expression" };
        }
    }
})