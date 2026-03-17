import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function hashPrompt(prompt: string): Promise<string> {
    // return hash('sha256', prompt, 'hex');
    
    const encoder = new TextEncoder();
    const buffer = encoder.encode(prompt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function getCache(prompt: string) {
    const cacheKey = `ai:${await hashPrompt(prompt)}`;

    const cached = await redis.get<string>(cacheKey);
    if (cached) {
        console.log(`Cache hit: ${cached}`);
        return cached;
    }

    console.log('Cache miss');
    return null;
}

export async function setCache(prompt: string, text: string) {
    const cacheKey = `ai:${await hashPrompt(prompt)}`;
    await redis.set(cacheKey, text, { ex: 3600 });  // cache for 1 hour
    return text;
}
