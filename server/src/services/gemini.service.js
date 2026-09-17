import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

let _genAI = null;

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
 * Calls the Gemini API to generate a concise summary and sentiment
 * breakdown (positive / neutral / negative percentages) from an array
 * of review objects.
 *
 * @param {Array<{ rating: number, title: string, body: string }>} reviews
 * @returns {Promise<{ summary: string, sentiment: { positive: number, neutral: number, negative: number } }>}
 */
export async function generateReviewInsights(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      summary: 'No reviews yet.',
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
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

Return ONLY valid JSON in this exact format:
{
  "summary": "A concise 2-3 sentence summary of what customers think about this product overall.",
  "sentiment": {
    "positive": <integer percentage 0-100>,
    "neutral": <integer percentage 0-100>,
    "negative": <integer percentage 0-100>
  }
}

Rules:
- positive + neutral + negative must sum to exactly 100
- Base sentiment on the tone and content of the reviews, not just star ratings
- The summary should highlight the most common praise and complaints
- Return ONLY the JSON object, no extra text
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Gemini returned non-JSON response: ${text.slice(0, 200)}`);
  }

  // Validate and normalise the response.
  const { summary, sentiment } = parsed;
  const positive = Math.max(0, Math.min(100, Math.round(Number(sentiment?.positive) || 0)));
  const negative = Math.max(0, Math.min(100, Math.round(Number(sentiment?.negative) || 0)));
  // Ensure percentages sum to 100.
  const neutral = Math.max(0, 100 - positive - negative);

  return {
    summary: typeof summary === 'string' && summary.trim() ? summary.trim() : 'No summary available.',
    sentiment: { positive, neutral, negative },
  };
}

export default { generateReviewInsights };
