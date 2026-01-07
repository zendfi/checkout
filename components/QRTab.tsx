'use client';

import { useEffect, useRef } from 'react';
import { useCheckoutStore } from '@/lib/store';

declare class QRious {
  constructor(options: { element: HTMLCanvasElement; value: string; size: number });
}

export function QRTab() {
  const { activeTab, checkoutData, setCopySuccessModalOpen } = useCheckoutStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrInitialized = useRef(false);

  useEffect(() => {
    if (activeTab !== 'qr' || !canvasRef.current || !checkoutData?.payment_url) return;
    if (qrInitialized.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js';
    script.onload = () => {
      if (canvasRef.current) {
        new QRious({
          element: canvasRef.current,
          value: checkoutData.payment_url,
          size: 280,
        });
        qrInitialized.current = true;
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
    };
  }, [activeTab, checkoutData?.payment_url]);

  const handleOpenSolanaPay = () => {
    if (checkoutData?.payment_url) {
      window.location.href = checkoutData.payment_url;
    }
  };

  const handleCopyAddress = () => {
    if (checkoutData?.wallet_address) {
      navigator.clipboard.writeText(checkoutData.wallet_address);
      setCopySuccessModalOpen(true);
      setTimeout(() => {
        setCopySuccessModalOpen(false);
      }, 2000);
    }
  };

  if (activeTab !== 'qr') return null;

  return (
    <div className="tab-content animate-fade-in">
      <div className="qr-container">
        <canvas ref={canvasRef} className="qr-code" />
      </div>

      <button className="btn btn-success mb-3" onClick={handleOpenSolanaPay}>
        Open in Wallet App
      </button>

      <button className="btn btn-secondary mb-4" onClick={handleCopyAddress}>
        Copy Wallet Address
      </button>

      <div className="info-box">
        Scan this QR code with any Solana wallet app (Phantom, Solflare, etc.)
      </div>
    </div>
  );
}
