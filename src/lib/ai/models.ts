import { google } from "@ai-sdk/google";

export const models = {
    'gemini-2.5-flash-lite': google('gemini-2.5-flash-lite'),
    'gemini-2.5-flash': google('gemini-2.5-flash'),
}