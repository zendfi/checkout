'use client';

import { useCheckoutStore } from '@/lib/store';

export function AmountDisplay() {
  const { amount, checkoutData } = useCheckoutStore();
  const token = checkoutData?.token || 'USDC';

  return (
    <div className="text-center mb-4">
      <div className="text-4xl font-bold text-gray-900 tracking-tight" id="display-amount">
        ${amount.toFixed(2)} {token}
      </div>
    </div>
  );
}
