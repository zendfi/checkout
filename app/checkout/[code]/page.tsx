'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useCheckoutStore } from '@/lib/store';
import { CheckoutHeader } from '@/components/CheckoutHeader';
import { AmountDisplay } from '@/components/AmountDisplay';
import { PWYWInput } from '@/components/PWYWInput';
import { TabNavigation } from '@/components/TabNavigation';
import { CustomerInfoForm } from '@/components/CustomerInfoForm';
import { WalletTab } from '@/components/WalletTab';
import { QRTab } from '@/components/QRTab';
import { BankTab } from '@/components/BankTab';
import { Timer } from '@/components/Timer';
import { Footer } from '@/components/Footer';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { SuccessModal } from '@/components/modals/SuccessModal';
import { CopySuccessModal } from '@/components/modals/CopySuccessModal';
import { WalletSelectorModal } from '@/components/modals/WalletSelectorModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

export default function CheckoutPage() {
  const params = useParams();
  const linkCode = params.code as string;
  
  const {
    checkoutData,
    setCheckoutData,
    setPaymentStatus,
    setSuccessModalOpen,
    successModalOpen,
    paymentStatus,
  } = useCheckoutStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkCode) return;

    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.createPaymentFromLink(linkCode);
        console.log('Checkout data loaded - Network:', data.solana_network, 'Token:', data.token);
        setCheckoutData(data);
      } catch (err) {
        console.error('Failed to load checkout:', err);
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError('Payment link not found. Please check the link and try again.');
          } else if (err.status === 410) {
            setError('This payment link has expired or reached its maximum uses.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Failed to load payment. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [linkCode, setCheckoutData]);

  const pollStatus = useCallback(async () => {
    if (!checkoutData?.payment_id) return;

    try {
      const status = await api.getPaymentStatus(checkoutData.payment_id);
      setPaymentStatus(status);

      if (status.status === 'confirmed' && !successModalOpen) {
        setSuccessModalOpen(true);
      }

      const terminalStates = ['confirmed', 'failed', 'expired', 'cancelled'];
      if (terminalStates.includes(status.status)) {
        return true;
      }
    } catch (err) {
      console.error('Status poll error:', err);
    }
    return false;
  }, [checkoutData?.payment_id, setPaymentStatus, setSuccessModalOpen, successModalOpen]);

  useEffect(() => {
    if (!checkoutData?.payment_id) return;

    const interval = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [checkoutData?.payment_id, pollStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useCheckoutStore.getState().closeErrorModal();
        useCheckoutStore.getState().setSuccessModalOpen(false);
        useCheckoutStore.getState().setCopySuccessModalOpen(false);
        useCheckoutStore.getState().setWalletSelectorOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!checkoutData) {
    return <ErrorState message="Failed to load payment data" />;
  }

  const isExpired = new Date(checkoutData.expires_at) < new Date();
  const isCompleted = paymentStatus?.status === 'confirmed';

  if (isExpired && !isCompleted) {
    return <ErrorState message="This payment has expired. Please request a new payment link." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full animate-slide-up">
        <CheckoutHeader
          merchantName={checkoutData.merchant_name}
          network={checkoutData.solana_network}
        />

        <div className="p-6">
          <AmountDisplay />
          
          {checkoutData.description && (
            <p className="text-gray-500 text-center mb-6">{checkoutData.description}</p>
          )}

          {checkoutData.allow_custom_amount && <PWYWInput />}

          <TabNavigation showBankTab={checkoutData.onramp} />

          <CustomerInfoForm />

          <WalletTab />
          <QRTab />
          {checkoutData.onramp && <BankTab />}

          <Timer expiresAt={checkoutData.expires_at} />
        </div>

        <Footer />
      </div>

      {/* Modals */}
      <ErrorModal />
      <SuccessModal />
      <CopySuccessModal />
      <WalletSelectorModal />
    </div>
  );
}
