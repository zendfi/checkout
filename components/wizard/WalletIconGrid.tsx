'use client';

import { useEffect, useState } from 'react';
import { getAvailableWallets, DetectedWallet } from '@/lib/wallet';

interface WalletIconGridProps {
  onWalletClick: (wallet: DetectedWallet | null) => void;
  showMore?: boolean;
}

// Wallet configurations with their icons
const WALLET_CONFIGS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: (
      <svg width="40" height="40" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="64" fill="#AB9FF2"/>
        <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.5898 33.5984 107.529 57.1333 108H62.2274C83.0038 108 110.584 89.1969 110.584 64.9142Z" fill="url(#paint0_linear_phantom)"/>
        <path d="M86.7048 64.9142C86.7048 60.0017 82.7011 56.0195 77.7619 56.0195C72.8227 56.0195 68.8191 60.0017 68.8191 64.9142C68.8191 69.8267 72.8227 73.8089 77.7619 73.8089C82.7011 73.8089 86.7048 69.8267 86.7048 64.9142Z" fill="white"/>
        <path d="M60.5238 64.9142C60.5238 60.0017 56.5202 56.0195 51.581 56.0195C46.6418 56.0195 42.6381 60.0017 42.6381 64.9142C42.6381 69.8267 46.6418 73.8089 51.581 73.8089C56.5202 73.8089 60.5238 69.8267 60.5238 64.9142Z" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear_phantom" x1="62.7" y1="23" x2="62.7" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="white"/>
            <stop offset="1" stopColor="white" stopOpacity="0.82"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: (
      <svg width="40" height="40" viewBox="0 0 101 88" fill="none">
        <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.310523 87.2029 0.160082 86.8659C0.00964039 86.5289 -0.0359048 86.1562 0.0294104 85.7945C0.0947257 85.4328 0.267982 85.0981 0.527423 84.8335L17.2004 67.4138C17.5628 67.0354 18.0014 66.7336 18.4887 66.5274C18.976 66.3212 19.5017 66.215 20.0329 66.2153H99.0715C99.4486 66.2153 99.8176 66.3226 100.133 66.5241C100.448 66.7256 100.696 67.0124 100.847 67.3494C100.997 67.6864 101.043 68.0591 100.978 68.4208C100.912 68.7825 100.739 69.1171 100.48 69.3817Z" fill="url(#paint0_linear_solflare)"/>
        <path d="M100.48 1.1989C100.117 0.820586 99.6787 0.518906 99.1914 0.312735C98.7041 0.106564 98.1784 0.000305961 97.6472 0H18.6086C18.2315 7.13797e-05 17.8625 0.107426 17.5472 0.308877C17.2318 0.510329 16.9835 0.797096 16.833 1.13411C16.6826 1.47113 16.6369 1.8438 16.7023 2.20551C16.7676 2.56722 16.9408 2.90191 17.2003 3.16649L33.8733 20.5862C34.2357 20.9646 34.6743 21.2663 35.1616 21.4725C35.6489 21.6787 36.1746 21.7849 36.7058 21.7847H115.744C116.122 21.7847 116.491 21.6773 116.806 21.4759C117.121 21.2744 117.37 20.9876 117.52 20.6506C117.671 20.3136 117.716 19.9409 117.651 19.5792C117.586 19.2175 117.413 18.8828 117.153 18.6183L100.48 1.1989Z" fill="url(#paint1_linear_solflare)"/>
        <path d="M17.2003 35.2183C16.9408 35.4828 16.7676 35.8175 16.7023 36.1792C16.6369 36.541 16.6826 36.9136 16.833 37.2506C16.9835 37.5877 17.2318 37.8744 17.5472 38.0759C17.8625 38.2773 18.2315 38.3847 18.6086 38.3847H97.6472C98.1784 38.385 98.7041 38.2787 99.1914 38.0726C99.6787 37.8664 100.117 37.5647 100.48 37.1863L117.153 19.7666C117.413 19.502 117.586 19.1673 117.651 18.8056C117.716 18.4439 117.671 18.0712 117.52 17.7342C117.37 17.3972 117.121 17.1104 116.806 16.909C116.491 16.7075 116.122 16.6001 115.744 16.6001H36.7058C36.1746 16.5999 35.6489 16.7061 35.1616 16.9123C34.6743 17.1184 34.2357 17.4202 33.8733 17.7985L17.2003 35.2183Z" fill="url(#paint2_linear_solflare)"/>
        <defs>
          <linearGradient id="paint0_linear_solflare" x1="8.5263" y1="90.0029" x2="88.9933" y2="64.5766" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCC00A"/>
            <stop offset="1" stopColor="#FC7B0A"/>
          </linearGradient>
          <linearGradient id="paint1_linear_solflare" x1="25.156" y1="23.789" x2="105.623" y2="-1.63731" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
          <linearGradient id="paint2_linear_solflare" x1="16.8382" y1="39.8884" x2="97.3052" y2="14.4621" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3"/>
            <stop offset="1" stopColor="#DC1FFF"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#E33E3F"/>
        <path d="M27.5 14H12.5C11.1193 14 10 15.1193 10 16.5V27.5C10 28.8807 11.1193 30 12.5 30H27.5C28.8807 30 30 28.8807 30 27.5V16.5C30 15.1193 28.8807 14 27.5 14Z" stroke="white" strokeWidth="2"/>
        <path d="M15 14V12C15 10.3431 16.3431 9 18 9H22C23.6569 9 25 10.3431 25 12V14" stroke="white" strokeWidth="2"/>
        <rect x="17" y="20" width="6" height="4" rx="1" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'glow',
    name: 'Glow',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0D1117"/>
        <circle cx="20" cy="20" r="12" fill="url(#glow_gradient)"/>
        <defs>
          <radialGradient id="glow_gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(12)">
            <stop stopColor="#FFD700"/>
            <stop offset="1" stopColor="#FF6B00"/>
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0052FF"/>
        <path d="M20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8ZM16.8 23.2C15.0327 23.2 13.6 21.7673 13.6 20C13.6 18.2327 15.0327 16.8 16.8 16.8H23.2C24.9673 16.8 26.4 18.2327 26.4 20C26.4 21.7673 24.9673 23.2 23.2 23.2H16.8Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'trust',
    name: 'Trust',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0500FF"/>
        <path d="M20 8L10 12V18C10 24.6274 14.4772 30.4411 20 32C25.5228 30.4411 30 24.6274 30 18V12L20 8Z" stroke="white" strokeWidth="2" fill="none"/>
        <path d="M17 20L19 22L23 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#3B99FC"/>
        <path d="M12.8 16.8C17.7706 11.8294 25.7294 11.8294 30.7 16.8L31.4 17.5C31.65 17.75 31.65 18.15 31.4 18.4L29.6 20.2C29.475 20.325 29.275 20.325 29.15 20.2L28.2 19.25C24.6765 15.7265 18.8235 15.7265 15.3 19.25L14.3 20.25C14.175 20.375 13.975 20.375 13.85 20.25L12.05 18.45C11.8 18.2 11.8 17.8 12.05 17.55L12.8 16.8ZM34.9 21.05L36.5 22.65C36.75 22.9 36.75 23.3 36.5 23.55L29.15 30.9C28.9 31.15 28.5 31.15 28.25 30.9L23.35 26C23.2875 25.9375 23.1875 25.9375 23.125 26L18.225 30.9C17.975 31.15 17.575 31.15 17.325 30.9L10 23.55C9.75 23.3 9.75 22.9 10 22.65L11.6 21.05C11.85 20.8 12.25 20.8 12.5 21.05L17.4 25.95C17.4625 26.0125 17.5625 26.0125 17.625 25.95L22.525 21.05C22.775 20.8 23.175 20.8 23.425 21.05L28.325 25.95C28.3875 26.0125 28.4875 26.0125 28.55 25.95L33.45 21.05C33.7 20.8 34.1 20.8 34.35 21.05H34.9Z" fill="white"/>
      </svg>
    ),
  },
];

export function WalletIconGrid({ onWalletClick, showMore = false }: WalletIconGridProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const wallets = getAvailableWallets();
    setDetectedWallets(wallets);
  }, []);

  const isWalletInstalled = (walletId: string) => {
    return detectedWallets.some(
      (w) => w.name.toLowerCase() === walletId.toLowerCase()
    );
  };

  const getDetectedWallet = (walletId: string) => {
    return detectedWallets.find(
      (w) => w.name.toLowerCase() === walletId.toLowerCase()
    );
  };

  const visibleWallets = showAll ? WALLET_CONFIGS : WALLET_CONFIGS.slice(0, 6);
  const hiddenCount = WALLET_CONFIGS.length - 6;

  return (
    <div className="space-y-4">
      <div className="wallet-grid">
        {visibleWallets.map((wallet) => {
          const isInstalled = isWalletInstalled(wallet.id);
          const detectedWallet = getDetectedWallet(wallet.id);

          return (
            <button
              key={wallet.id}
              className="wallet-icon-btn"
              onClick={() => onWalletClick(detectedWallet || null)}
              title={wallet.name}
              disabled={!isInstalled}
              style={{ opacity: isInstalled ? 1 : 0.5 }}
            >
              {wallet.icon}
              {isInstalled && <div className="wallet-installed-badge" />}
            </button>
          );
        })}
      </div>

      {showMore && !showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>Other Wallets</span>
          <span className="token-more">+{hiddenCount}</span>
        </button>
      )}
    </div>
  );
}
