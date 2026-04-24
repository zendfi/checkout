import { NextRequest, NextResponse } from 'next/server';

type GreetingPayload = {
  country_code: string;
  greeting: string;
  source: 'gemini' | 'fallback';
};

const GEO_HEADER_KEYS = ['cf-ipcountry', 'x-vercel-ip-country', 'x-country-code'];

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  MX: 'Mexico',
  US: 'the United States',
  GB: 'the United Kingdom',
  BR: 'Brazil',
  CO: 'Colombia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  KE: 'Kenya',
  ZA: 'South Africa',
  IN: 'India',
  JP: 'Japan',
  CA: 'Canada',
};

function normalizeCountry(input: string | null | undefined): string | null {
  if (!input) return null;
  const code = input.trim().toUpperCase();
  if (code.length !== 2) return null;
  return code;
}

function detectCountryCode(request: NextRequest): string {
  const queryCode = normalizeCountry(request.nextUrl.searchParams.get('country_code'));
  if (queryCode) return queryCode;

  for (const key of GEO_HEADER_KEYS) {
    const value = normalizeCountry(request.headers.get(key));
    if (value) return value;
  }

  return 'US';
}

function stripWrappingQuotes(text: string): string {
  let output = text.trim();
  if ((output.startsWith('"') && output.endsWith('"')) || (output.startsWith("'") && output.endsWith("'"))) {
    output = output.slice(1, -1).trim();
  }
  return output;
}

function sanitizeGreeting(text: string, countryCode: string): string {
  const cleaned = stripWrappingQuotes(text)
    .replace(/\s+/g, ' ')
    .trim();

  const fallback = buildFallbackGreeting(countryCode);

  if (!cleaned) return fallback;
  if (cleaned.length < 18 || cleaned.length > 180) return fallback;
  return cleaned;
}

function buildFallbackGreeting(countryCode: string): string {
  switch (countryCode) {
    case 'NG':
      return "Hey, welcome from Nigeria. We’re pulling your local payment details now.";
    case 'MX':
      return "Hola! Welcome from Mexico. We’re getting your payment details ready for you.";
    case 'BR':
      return 'Oi! Welcome from Brazil. We’re fetching your payment details now.';
    case 'GB':
      return "Hi from the UK. We’re getting your payment details ready now.";
    default: {
      const countryName = COUNTRY_NAMES[countryCode] || 'your location';
      return `Hi there from ${countryName}. We’re fetching your payment details now.`;
    }
  }
}

async function generateGeminiGreeting(countryCode: string, timeoutMs = 2200): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;

  const prompt = [
    'You are writing loading-screen copy for a checkout page.',
    'Goal: a short, casual, comforting greeting based on user country.',
    `Country code: ${countryCode}. Country name: ${countryName}.`,
    'Rules:',
    '- Return exactly one sentence.',
    '- Keep it 14-28 words.',
    '- Friendly and clear, no hype, no emojis, no hashtags.',
    '- Mention we are fetching payment details.',
    '- Local flavor is welcome but keep it understandable in global English.',
    '- Do not mention AI, model, or policy.',
    '- Output plain text only.',
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.75,
            topP: 0.9,
            maxOutputTokens: 80,
          },
        }),
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return sanitizeGreeting(text, countryCode);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const countryCode = detectCountryCode(request);

  const geminiGreeting = await generateGeminiGreeting(countryCode);

  const payload: GreetingPayload = geminiGreeting
    ? {
        country_code: countryCode,
        greeting: geminiGreeting,
        source: 'gemini',
      }
    : {
        country_code: countryCode,
        greeting: buildFallbackGreeting(countryCode),
        source: 'fallback',
      };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
