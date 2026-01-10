'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Wallet } from 'lucide-react';
import { getAvailableWallets, DetectedWallet } from '@/lib/wallet';

interface WalletIconGridProps {
  onWalletClick: (wallet: DetectedWallet | null) => void;
  showMore?: boolean;
}

// Wallet logo mappings to actual SVG files
const WALLET_LOGOS: Record<string, string> = {
  phantom: '/svg/phantom.svg',
  solflare: '/svg/solfare.svg',
  backpack: '/svg/phantom.svg', // fallback to phantom until we get backpack logo
  coinbase: '/svg/coinbase.svg',
  trust: '/svg/trust.svg',
  walletconnect: '/svg/walletconnect.svg',
  glow: '/svg/phantom.svg', // fallback until we get glow logo
  metamask: '/svg/phantom.svg', // fallback until we get metamask logo
  rainbow: '/svg/phantom.svg', // fallback
  sollet: '/svg/phantom.svg', // fallback
  slope: '/svg/phantom.svg', // fallback
  exodus: '/svg/phantom.svg', // fallback
  brave: '/svg/phantom.svg', // fallback
  ledger: '/svg/phantom.svg', // fallback
};

// Primary wallets shown in main grid (6 wallets, clean layout)
const PRIMARY_WALLETS = [
  { id: 'phantom', name: 'Phantom', priority: 1 },
  { id: 'solflare', name: 'Solflare', priority: 2 },
  { id: 'backpack', name: 'Backpack', priority: 3 },
  { id: 'coinbase', name: 'Coinbase', priority: 4 },
  { id: 'trust', name: 'Trust', priority: 5 },
  { id: 'walletconnect', name: 'WalletConnect', priority: 6 },
];

// Secondary wallets shown in expandable section
const OTHER_WALLETS = [
  { id: 'glow', name: 'Glow' },
  { id: 'metamask', name: 'MetaMask' },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'exodus', name: 'Exodus' },
  { id: 'brave', name: 'Brave' },
  { id: 'ledger', name: 'Ledger' },
];

export function WalletIconGrid({ onWalletClick, showMore = false }: WalletIconGridProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [showOtherWallets, setShowOtherWallets] = useState(false);

  useEffect(() => {
    const wallets = getAvailableWallets();
    setDetectedWallets(wallets);
  }, []);

  const isWalletInstalled = (walletId: string) => {
    return detectedWallets.some(
      (w) => w.name.toLowerCase().includes(walletId.toLowerCase()) ||
             walletId.toLowerCase().includes(w.name.toLowerCase())
    );
  };

  const getDetectedWallet = (walletId: string) => {
    return detectedWallets.find(
      (w) => w.name.toLowerCase().includes(walletId.toLowerCase()) ||
             walletId.toLowerCase().includes(w.name.toLowerCase())
    );
  };

  const installedCount = PRIMARY_WALLETS.filter(w => isWalletInstalled(w.id)).length;

  const renderWalletButton = (wallet: { id: string; name: string }, index: number) => {
    const isInstalled = isWalletInstalled(wallet.id);
    const detectedWallet = getDetectedWallet(wallet.id);
    const logoPath = WALLET_LOGOS[wallet.id] || WALLET_LOGOS.phantom;

    return (
      <button
        key={wallet.id}
        className="wallet-btn"
        onClick={() => onWalletClick(detectedWallet || null)}
        aria-label={`Connect with ${wallet.name}${isInstalled ? ' (Installed)' : ''}`}
        title={wallet.name}
      >
        <div className="wallet-btn-icon">
          <Image
            src={logoPath}
            alt={wallet.name}
            width={36}
            height={36}
            className="rounded-lg"
          />
        </div>
        {isInstalled && (
          <span 
            className="wallet-installed-dot" 
            aria-label="Installed"
          />
        )}
        <span className="wallet-btn-name">{wallet.name}</span>
      </button>
    );
  };

  return (
    <div className="wallet-section">
      {/* Accessibility announcement */}
      <span className="sr-only">
        {PRIMARY_WALLETS.length} wallets available, {installedCount} installed
      </span>

      {/* Primary Wallet Grid - 6 columns on desktop */}
      <div className="wallet-grid-pro">
        {PRIMARY_WALLETS.map((wallet, index) => renderWalletButton(wallet, index))}
      </div>

      {/* Other Wallets Expandable Section */}
      {showMore && OTHER_WALLETS.length > 0 && (
        <div className="other-wallets-section">
          <button
            onClick={() => setShowOtherWallets(!showOtherWallets)}
            className="other-wallets-toggle"
            aria-expanded={showOtherWallets}
          >
            <div className="other-wallets-toggle-left">
              <Wallet className="w-5 h-5 text-gray-400" />
              <span>Other Wallets</span>
            </div>
            <div className="other-wallets-toggle-right">
              <span className="other-wallets-badge">+{OTHER_WALLETS.length}</span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showOtherWallets ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </button>

          {showOtherWallets && (
            <div className="wallet-grid-pro mt-4 animate-slide-down">
              {OTHER_WALLETS.map((wallet, index) => renderWalletButton(wallet, index))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
