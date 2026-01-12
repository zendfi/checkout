'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useCheckoutStore } from '@/lib/store';
import { OnrampCheckout } from '@/components/wizard/OnrampCheckout';
import { CryptoCheckout } from '@/components/wizard/CryptoCheckout';
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load checkout data
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

  // Poll for payment status
  const pollStatus = useCallback(async () => {
    if (!checkoutData?.payment_id) return false;

    try {
      const status = await api.getPaymentStatus(checkoutData.payment_id);
      setPaymentStatus(status);

      if (status.status === 'confirmed' && !successModalOpen) {
        setSuccessModalOpen(true);
      }

      const terminalStates = ['confirmed', 'failed', 'expired', 'cancelled'];
      return terminalStates.includes(status.status);
    } catch (err) {
      console.error('Status poll error:', err);
      return false;
    }
  }, [checkoutData?.payment_id, setPaymentStatus, setSuccessModalOpen, successModalOpen]);

  useEffect(() => {
    if (!checkoutData?.payment_id) return;

    const terminalStates = ['confirmed', 'failed', 'expired', 'cancelled'];
    if (paymentStatus && terminalStates.includes(paymentStatus.status)) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      const shouldStop = await pollStatus();
      if (shouldStop && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkoutData?.payment_id, pollStatus, paymentStatus]);

  // Handle keyboard shortcuts
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

  // Ultra-lightweight onramp flow
  if (checkoutData.onramp) {
    return (
      <>
        <OnrampCheckout />
        <ErrorModal />
        <SuccessModal />
        <CopySuccessModal />
      </>
    );
  }

  // Clean crypto checkout flow
  return (
    <>
      <CryptoCheckout />
      <ErrorModal />
      <SuccessModal />
      <CopySuccessModal />
      <WalletSelectorModal />
    </>
  );
}
