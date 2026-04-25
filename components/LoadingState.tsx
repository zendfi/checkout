'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '@/lib/api';

interface PublicGeoContextResponse {
  country_code?: string;
}

interface GeoGreetingResponse {
  country_code?: string;
  greeting?: string;
  source?: 'gemini' | 'fallback';
}

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  MX: 'Mexico',
  US: 'the United States',
  GB: 'the United Kingdom',
  BR: 'Brazil',
  CO: 'Colombia',
  DE: 'Germany',
  FR: 'France',
};

function getGreeting(countryCode: string | null): string {
  switch (countryCode) {
    case 'NG':
      return "Hi, I can see you're from Nigeria. Let's fetch your payment details.";
    case 'MX':
      return "Hola! I can see you're from Mexico. Let's fetch your payment details for you.";
    case 'GB':
      return "Hi there, I can see you're from the UK. Let's fetch your payment details.";
    case 'BR':
      return 'Oi! We detected Brazil. Fetching your localized payment details now.';
    case 'CO':
      return 'Hola! We detected Colombia. Fetching your payment details now.';
    default:
      if (countryCode && COUNTRY_NAMES[countryCode]) {
        return `Hi, I can see you're from ${COUNTRY_NAMES[countryCode]}. Let's fetch your payment details.`;
      }
      return "Hi, we're detecting your location and preparing your payment details.";
  }
}

function guessCountryFromBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;
  const locale = navigator.language || '';
  const parts = locale.split('-');
  if (parts.length < 2) return null;
  const maybeCode = parts[1]?.trim().toUpperCase();
  return maybeCode && maybeCode.length === 2 ? maybeCode : null;
}

export function LoadingState() {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [engineGreeting, setEngineGreeting] = useState<string | null>(null);

  const publicGeoUrl = `${API_BASE}/api/v1/public/geo`;
  const sameOriginGreetingUrl = (code: string) =>
    `/api/geo-greeting?country_code=${encodeURIComponent(code)}`;

  useEffect(() => {
    let cancelled = false;

    const detectCountry = async () => {
      try {
        const response = await fetch(publicGeoUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error('geo endpoint unavailable');
        const data: PublicGeoContextResponse = await response.json();
        const code = data.country_code?.trim().toUpperCase();
        if (!cancelled && code && code.length === 2) {
          setCountryCode(code);
          try {
            const greetingResponse = await fetch(sameOriginGreetingUrl(code), {
              cache: 'no-store',
            });
            if (!greetingResponse.ok) throw new Error('greeting endpoint unavailable');
            const greetingData: GeoGreetingResponse = await greetingResponse.json();
            if (!cancelled && greetingData.greeting) {
              setEngineGreeting(greetingData.greeting);
            }
          } catch {
            // Loading should continue even if greeting generation fails.
          }
          return;
        }
      } catch {
        // Ignore and fallback to browser locale.
      }

      const fallbackCode = guessCountryFromBrowser();
      if (!cancelled && fallbackCode) {
        setCountryCode(fallbackCode);
        try {
          const greetingResponse = await fetch(sameOriginGreetingUrl(fallbackCode), {
            cache: 'no-store',
          });
          if (!greetingResponse.ok) throw new Error('greeting endpoint unavailable');
          const greetingData: GeoGreetingResponse = await greetingResponse.json();
          if (!cancelled && greetingData.greeting) {
            setEngineGreeting(greetingData.greeting);
          }
        } catch {
          // Loading should continue even if greeting generation fails.
        }
      }
    };

    void detectCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = useMemo(() => engineGreeting || getGreeting(countryCode), [countryCode, engineGreeting]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFC]">
      <div className="card max-w-[420px] w-full p-12 text-center animate-fade-in">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Detecting your location</h2>
        <p className="text-gray-500 text-xs">{greeting}</p>
      </div>
    </div>
  );
}
