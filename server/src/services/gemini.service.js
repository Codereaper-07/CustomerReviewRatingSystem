import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

let _genAI = null;
let lastRequestTimestamp = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGenAI() {
  if (!_genAI) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    _genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return _genAI;
}

/**
 * Enforces the maximum requests-per-minute rate limit.
 * If calls happen too fast, it sleeps for the difference so calls are spaced out evenly.
 */
async function throttleRateLimit() {
  const maxRpm = env.geminiMaxRpm || 5;
  const minIntervalMs = Math.ceil(60_000 / maxRpm); // e.g. 60,000 / 5 = 12,000ms

  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;
  if (elapsed < minIntervalMs) {
    const waitMs = minIntervalMs - elapsed;
    console.log(`[gemini.service] Rate limiter: spacing request by ${(waitMs / 1000).toFixed(1)}s (${maxRpm} RPM limit)...`);
    await sleep(waitMs);
  }
  lastRequestTimestamp = Date.now();
}

/**
 * Parses retry delay from Gemini's 429 error response if available.
 * Defaults to 25 seconds if not explicitly stated.
 */
function parseRetryDelayMs(error) {
  const message = error?.message || String(error);

  // Pattern 1: "Please retry in 25.16s"
  const match1 = /retry in\s+([\d.]+)\s*s/i.exec(message);
  if (match1) {
    return Math.ceil(parseFloat(match1[1]) * 1000);
  }

  // Pattern 2: "retryDelay":"25s"
  const match2 = /retryDelay["']?\s*:\s*["']?(\d+)/i.exec(message);
  if (match2) {
    return parseInt(match2[1], 10) * 1000;
  }

  return 25_000; // default 25s backoff
}

function isQuotaOrRateLimitError(error) {
  const status = error?.status;
  const message = error?.message || String(error);
  return (
    status === 429 ||
    message.includes('429') ||
    message.includes('Too Many Requests') ||
    message.includes('Quota exceeded') ||
    message.includes('RATE_LIMIT_EXCEEDED')
  );
}

/**
 * Calls the Gemini API to generate a concise summary and sentiment
 * breakdown (positive / neutral / negative percentages) from an array
 * of review objects.
 *
 * Implements rate limiting and automatic retry on 429 Too Many Requests.
 *
 * @param {Array<{ rating: number, title: string, body: string }>} reviews
 * @returns {Promise<{ summary: string, sentiment: { positive: number, neutral: number, negative: number } }>}
 */
export async function generateReviewInsights(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      isGibberish: false,
      summary: 'No reviews yet.',
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  const genAI = getGenAI();
  const modelName = env.geminiModel || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // Build a condensed review list for the prompt — send only what Gemini needs.
  const reviewText = reviews
    .map((r, i) => `Review ${i + 1} (${r.rating}/5 stars):\nTitle: ${r.title}\nBody: ${r.body}`)
    .join('\n\n');

  const prompt = `
You are a product review analyst. Analyze the following customer reviews and return a JSON object.

Customer Reviews:
${reviewText}

Evaluate if the reviews are coherent or gibberish.
- Set "isGibberish": true if the reviews predominantly contain random character mash (e.g. "asdfasdf", "kjsdhf"), repetitive nonsense, placeholder text (e.g. "test test", "lorem ipsum"), or lack any intelligible customer feedback about the product.
- Set "isGibberish": false if the reviews contain genuine, understandable human feedback or opinions (even if brief or informal).

Return ONLY valid JSON in this exact format:
{
  "isGibberish": <boolean>,
  "summary": <string or null> (A concise 2-3 sentence summary of what customers think about this product overall. If isGibberish is true, this must be null),
  "sentiment": {
    "positive": <integer percentage 0-100>,
    "neutral": <integer percentage 0-100>,
    "negative": <integer percentage 0-100>
  }
}

Rules:
- If isGibberish is true, set summary to null and set positive, neutral, negative all to 0.
- If isGibberish is false, positive + neutral + negative must sum to exactly 100.
- Base sentiment on the tone and content of the reviews, not just star ratings.
- The summary should highlight the most common praise and complaints.
- Return ONLY the JSON object, no extra text.
`;

  const MAX_ATTEMPTS = 3;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // Enforce rate limiter before each request
      await throttleRateLimit();

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`Gemini returned non-JSON response: ${text.slice(0, 200)}`);
      }

      // Validate and normalise the response.
      const isGibberish = Boolean(parsed.isGibberish);
      let summary = null;
      let positive = 0;
      let neutral = 0;
      let negative = 0;

      if (!isGibberish) {
        positive = Math.max(0, Math.min(100, Math.round(Number(parsed.sentiment?.positive) || 0)));
        negative = Math.max(0, Math.min(100, Math.round(Number(parsed.sentiment?.negative) || 0)));
        neutral = Math.max(0, 100 - positive - negative);
        summary = typeof parsed.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : null;
      }

      return {
        isGibberish,
        summary,
        sentiment: { positive, neutral, negative },
      };
    } catch (err) {
      lastError = err;
      if (isQuotaOrRateLimitError(err) && attempt < MAX_ATTEMPTS) {
        const retryDelayMs = parseRetryDelayMs(err) + 2000; // Add 2s safety margin
        console.warn(
          `[gemini.service] 429 Quota/Rate limit reached. Waiting ${(retryDelayMs / 1000).toFixed(1)}s before retry (attempt ${attempt}/${MAX_ATTEMPTS})...`
        );
        await sleep(retryDelayMs);
        lastRequestTimestamp = Date.now();
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export default { generateReviewInsights };

