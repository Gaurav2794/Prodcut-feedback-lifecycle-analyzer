import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

/**
 * Wrapper for ai.models.generateContent with exponential backoff retry logic.
 * Useful for handling transient 429 Too Many Requests errors.
 */
export async function generateContentWithRetry(
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 3,
  baseDelayMs = 1000
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.status === 429 || error?.message?.includes('429');
      if (isRateLimit && attempt < maxRetries) {
        // Exponential backoff: baseDelayMs * (2 ^ (attempt - 1)) + jitter
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.warn(`[GenAI] Rate limited (429). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Throw if we've exhausted retries or it's a different error
        throw error;
      }
    }
  }
  throw new Error('generateContentWithRetry failed');
}
