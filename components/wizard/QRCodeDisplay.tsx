'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    QRious: new (options: { element: HTMLCanvasElement; value: string; size: number; background: string; foreground: string; level: string }) => void;
  }
}

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const generateQR = () => {
      if (canvasRef.current && window.QRious) {
        new window.QRious({
          element: canvasRef.current,
          value: value,
          size: size,
          background: 'white',
          foreground: '#111827',
          level: 'M',
        });
        setIsLoaded(true);
      }
    };

    // Check if QRious is already loaded
    if (window.QRious) {
      generateQR();
      return;
    }

    // Load QRious script
    const existingScript = document.querySelector('script[src*="qrious"]');
    if (existingScript) {
      existingScript.addEventListener('load', generateQR);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js';
    script.onload = generateQR;
    document.head.appendChild(script);
  }, [value, size]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className={`rounded-lg transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        width={size}
        height={size}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}
