'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useCheckoutStore } from '@/lib/store';
import { CryptoCheckout } from '@/components/wizard/CryptoCheckout';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { SuccessModal } from '@/components/modals/SuccessModal';
import { WalletSelectorModal } from '@/components/modals/WalletSelectorModal';

export default function PayPage() {
  const params = useParams();
  const paymentId = params.id as string;
  
  const { setCheckoutData } = useCheckoutStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    const loadPaymentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.getPaymentData(paymentId);
        console.log('Payment data loaded - Network:', data.solana_network, 'Token:', data.token);
        
        setCheckoutData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load payment';
        console.error('Failed to load payment data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [paymentId, setCheckoutData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFBFC]">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFBFC] px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Not Found</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CryptoCheckout />
      
      {/* Modals - controlled by Zustand store */}
      <ErrorModal />
      <SuccessModal />
      <WalletSelectorModal />
    </>
  );
}

