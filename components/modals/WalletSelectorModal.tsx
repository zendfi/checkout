'use client';

import { useCheckoutStore } from '@/lib/store';
import { getAvailableWallets, connectToWallet, DetectedWallet } from '@/lib/wallet';
import { WalletIcon } from '@/components/icons';

const walletIcons: Record<string, React.ReactNode> = {
  Phantom: (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Solflare: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" d="M12 2v20m0-20C6.5 8 4 12 4 16s2.5 6 8 6m0-20c5.5 6 8 10 8 14s-2.5 6-8 6" />
    </svg>
  ),
  Backpack: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" d="M4 9h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm4-2V5a2 2 0 012-2h4a2 2 0 012 2v2M8 13h8" />
    </svg>
  ),
  Glow: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Slope: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 20l7-10 4 4 7-12" />
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
      <div className="modal-content max-w-[420px]">
        <div className="px-6 py-5 text-center">
          <div className="flex justify-center mb-3">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="#8866ff"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
              <path strokeWidth="2" d="M16 10h.01" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Choose Your Wallet</h2>
          <p className="text-gray-500 text-sm mt-1">Select which wallet you&apos;d like to connect</p>
        </div>

        <div className="px-6 pb-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.name}
              className="wallet-option"
              onClick={() => handleSelectWallet(wallet)}
            >
              <div className="wallet-icon">
                {walletIcons[wallet.name] || <WalletIcon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">{wallet.name}</div>
                <div className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Installed
                </div>
              </div>
              <span className="text-brand-purple text-xl">→</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            className="btn btn-secondary w-full"
            onClick={() => setWalletSelectorOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
