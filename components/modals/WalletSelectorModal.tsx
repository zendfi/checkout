'use client';

import { useCheckoutStore } from '@/lib/store';
import { getAvailableWallets, connectToWallet, DetectedWallet } from '@/lib/wallet';
import { Wallet, Check, ChevronRight, X } from 'lucide-react';

const walletIcons: Record<string, React.ReactNode> = {
  Phantom: (
    <svg width="28" height="28" viewBox="0 0 128 128" fill="none">
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
  Solflare: (
    <svg width="28" height="28" viewBox="0 0 101 88" fill="none">
      <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.310523 87.2029 0.160082 86.8659C0.00964039 86.5289 -0.0359048 86.1562 0.0294104 85.7945C0.0947257 85.4328 0.267982 85.0981 0.527423 84.8335L17.2004 67.4138C17.5628 67.0354 18.0014 66.7336 18.4887 66.5274C18.976 66.3212 19.5017 66.215 20.0329 66.2153H99.0715C99.4486 66.2153 99.8176 66.3226 100.133 66.5241C100.448 66.7256 100.696 67.0124 100.847 67.3494C100.997 67.6864 101.043 68.0591 100.978 68.4208C100.912 68.7825 100.739 69.1171 100.48 69.3817Z" fill="url(#paint0_linear_solflare)"/>
      <path d="M100.48 1.1989C100.117 0.820586 99.6787 0.518906 99.1914 0.312735C98.7041 0.106564 98.1784 0.000305961 97.6472 0H18.6086C18.2315 7.13797e-05 17.8625 0.107426 17.5472 0.308877C17.2318 0.510329 16.9835 0.797096 16.833 1.13411C16.6826 1.47113 16.6369 1.8438 16.7023 2.20551C16.7676 2.56722 16.9408 2.90191 17.2003 3.16649L33.8733 20.5862C34.2357 20.9646 34.6743 21.2663 35.1616 21.4725C35.6489 21.6787 36.1746 21.7849 36.7058 21.7847H115.744C116.122 21.7847 116.491 21.6773 116.806 21.4759C117.121 21.2744 117.37 20.9876 117.52 20.6506C117.671 20.3136 117.716 19.9409 117.651 19.5792C117.586 19.2175 117.413 18.8828 117.153 18.6183L100.48 1.1989Z" fill="url(#paint1_linear_solflare)"/>
      <defs>
        <linearGradient id="paint0_linear_solflare" x1="8.5263" y1="90.0029" x2="88.9933" y2="64.5766" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCC00A"/>
          <stop offset="1" stopColor="#FC7B0A"/>
        </linearGradient>
        <linearGradient id="paint1_linear_solflare" x1="25.156" y1="23.789" x2="105.623" y2="-1.63731" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/>
          <stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Backpack: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#E33E3F"/>
      <path d="M27.5 14H12.5C11.1193 14 10 15.1193 10 16.5V27.5C10 28.8807 11.1193 30 12.5 30H27.5C28.8807 30 30 28.8807 30 27.5V16.5C30 15.1193 28.8807 14 27.5 14Z" stroke="white" strokeWidth="2"/>
      <path d="M15 14V12C15 10.3431 16.3431 9 18 9H22C23.6569 9 25 10.3431 25 12V14" stroke="white" strokeWidth="2"/>
      <rect x="17" y="20" width="6" height="4" rx="1" fill="white"/>
    </svg>
  ),
  Glow: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
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
};

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
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-[440px]">
        {/* Header */}
        <div className="modal-header relative">
          <button
            onClick={() => setWalletSelectorOpen(false)}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="modal-header-icon">
            <Wallet className="w-7 h-7" />
          </div>
          <h2 className="modal-title">Choose Your Wallet</h2>
          <p className="modal-subtitle">Select which wallet you&apos;d like to connect</p>
        </div>

        {/* Wallet List */}
        <div className="modal-body">
          {wallets.map((wallet) => (
            <div
              key={wallet.name}
              className="wallet-option"
              onClick={() => handleSelectWallet(wallet)}
            >
              <div className="wallet-icon">
                {walletIcons[wallet.name] || <Wallet className="w-6 h-6 text-gray-400" />}
              </div>
              <div className="wallet-info">
                <div className="wallet-name">{wallet.name}</div>
                <div className="wallet-status">
                  <Check className="w-3.5 h-3.5" />
                  Installed
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              if (wallets.length > 0) {
                handleSelectWallet(wallets[0]);
              }
            }}
          >
            Connect Wallet ({wallets.length} detected)
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Supports Phantom, Solflare, Backpack, Glow & more
          </p>
        </div>
      </div>
    </div>
  );
}
