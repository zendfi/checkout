'use client';

import { useCheckoutStore } from '@/lib/store';

interface TabNavigationProps {
  showBankTab: boolean;
}

export function TabNavigation({ showBankTab }: TabNavigationProps) {
  const { activeTab, setActiveTab } = useCheckoutStore();

  return (
    <div className="flex border-b border-gray-200 mb-6 gap-6">
      <button
        className={`tab ${activeTab === 'wallet' ? 'active' : ''}`}
        onClick={() => setActiveTab('wallet')}
      >
        Pay with Wallet
      </button>
      <button
        className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
        onClick={() => setActiveTab('qr')}
      >
        QR Code
      </button>
      {showBankTab && (
        <button
          className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          Pay with Bank
        </button>
      )}
    </div>
  );
}
