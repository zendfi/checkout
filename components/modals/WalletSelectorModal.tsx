'use client';

import { useCheckoutStore } from '@/lib/store';
import { getAvailableWallets, connectToWallet, DetectedWallet } from '@/lib/wallet';
import Image from 'next/image';

// Map wallet names to public SVG files
const walletLogos: Record<string, string> = {
  Phantom: '/svg/phantom.svg',
  Solflare: '/svg/solfare.svg', // Note: file is named "solfare" not "solflare"
  Coinbase: '/svg/coinbase.svg',
  Trust: '/svg/trust.svg',
  WalletConnect: '/svg/walletconnect.svg',
};

// Fallback icons for wallets without public SVGs
const fallbackIcons: Record<string, React.ReactNode> = {
  Backpack: (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#E33E3F"/>
      <path d="M27.5 14H12.5C11.1193 14 10 15.1193 10 16.5V27.5C10 28.8807 11.1193 30 12.5 30H27.5C28.8807 30 30 28.8807 30 27.5V16.5C30 15.1193 28.8807 14 27.5 14Z" stroke="white" strokeWidth="2"/>
      <path d="M15 14V12C15 10.3431 16.3431 9 18 9H22C23.6569 9 25 10.3431 25 12V14" stroke="white" strokeWidth="2"/>
      <rect x="17" y="20" width="6" height="4" rx="1" fill="white"/>
    </svg>
  ),
  Glow: (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#0D1117"/>
      <circle cx="20" cy="20" r="12" fill="url(#glow_gradient)"/>
      <defs>
        <radialGradient id="glow_gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(12)">
          <stop stopColor="#FFD700"/>
          <stop offset="1" stopColor="#FF6B00"/>
        </radialGradient>
      </defs>
    </svg>
  ),
  Slope: (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#6366F1"/>
      <path d="M12 28L20 12L28 28H12Z" fill="white"/>
    </svg>
  ),
};

// Generic wallet icon
const GenericWalletIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/>
    <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
  </svg>
);

// Checkmark icon
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Close icon
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Arrow icon
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// Wallet header icon
const WalletHeaderIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/>
    <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
  </svg>
);

function WalletIcon({ wallet }: { wallet: DetectedWallet }) {
  const logoPath = walletLogos[wallet.name];
  const fallback = fallbackIcons[wallet.name];

  if (logoPath) {
    return (
      <Image
        src={logoPath}
        alt={`${wallet.name} logo`}
        width={32}
        height={32}
        className="rounded-lg"
      />
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <GenericWalletIcon />;
}

export function WalletSelectorModal() {
  const {
    walletSelectorOpen,
    setWalletSelectorOpen,
    setWallet,
    setError,
  } = useCheckoutStore();

  if (!walletSelectorOpen) return null;

  const wallets = getAvailableWallets();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setWalletSelectorOpen(false);
    }
  };

  const handleSelectWallet = async (wallet: DetectedWallet) => {
    try {
      setWalletSelectorOpen(false);
      const publicKey = await connectToWallet(wallet);
      setWallet({
        name: wallet.name,
        publicKey,
        provider: wallet.provider,
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md bg-[#FAFBFC] rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up sm:animate-scale-in"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => setWalletSelectorOpen(false)}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <CloseIcon />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <WalletHeaderIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connect Wallet</h2>
            <p className="text-sm text-gray-500 mt-1">Select your preferred wallet</p>
          </div>
        </div>

        {/* Wallet List */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <GenericWalletIcon />
              </div>
              <p className="text-gray-600 font-medium">No wallets detected</p>
              <p className="text-gray-400 text-sm mt-1">Install a Solana wallet to continue</p>
            </div>
          ) : (
            wallets.map((wallet, index) => (
              <button
                key={wallet.name}
                onClick={() => handleSelectWallet(wallet)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInFromRight 200ms ease-out forwards',
                  opacity: 0,
                  transform: 'translateX(10px)'
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <WalletIcon wallet={wallet} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{wallet.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-0.5">
                    <CheckIcon />
                    <span>Detected</span>
                  </div>
                </div>
                <ArrowRightIcon />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white safe-area-bottom">
          <p className="text-center text-xs text-gray-400">
            {wallets.length > 0 
              ? `${wallets.length} wallet${wallets.length > 1 ? 's' : ''} ready to connect`
              : 'Supports Phantom, Solflare, Backpack & more'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
