'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useCheckoutStore } from '@/lib/store';
import { ProgressIndicator } from '@/components/wizard/ProgressIndicator';
import { CheckoutHeaderNew } from '@/components/wizard/CheckoutHeaderNew';
import { PersonalInfoStep } from '@/components/wizard/PersonalInfoStep';
import { PaymentMethodStep } from '@/components/wizard/PaymentMethodStep';
import { SecurityFooter } from '@/components/wizard/SecurityFooter';
import { OnrampCheckout } from '@/components/wizard/OnrampCheckout';
import { Timer } from '@/components/Timer';
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
    wizardStep,
    setWizardStep,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
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

  const handleStep1Complete = () => {
    setWizardStep(2);
  };

  const handleBackToStep1 = () => {
    setWizardStep(1);
  };

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

  // Debug: log onramp value
  console.log('Checkout data - onramp:', checkoutData.onramp, 'full data:', checkoutData);

  if (isExpired && !isCompleted) {
    return <ErrorState message="This payment has expired. Please request a new payment link." />;
  }

  // Ultra-lightweight onramp flow
  if (checkoutData.onramp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-gray-50">
        <OnrampCheckout />
        
        {/* Modals */}
        <ErrorModal />
        <SuccessModal />
        <CopySuccessModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="card max-w-[420px] w-full animate-slide-up">
        {/* Header */}
        <CheckoutHeaderNew 
          merchantName={checkoutData.merchant_name} 
          network={checkoutData.solana_network} 
        />

        {/* Progress Indicator */}
        <div className="px-4 border-b border-gray-100">
          <ProgressIndicator currentStep={wizardStep} totalSteps={2} />
        </div>

        {/* Step Content */}
        <div className="p-4">
          {wizardStep === 1 && (
            <PersonalInfoStep onContinue={handleStep1Complete} />
          )}

          {wizardStep === 2 && (
            <PaymentMethodStep
              onBack={handleBackToStep1}
              customerName={customerName}
              customerEmail={customerEmail}
            />
          )}

          {/* Timer (only show on step 2) */}
          {wizardStep === 2 && !isCompleted && !isExpired && (
            <div className="mt-4">
              <Timer expiresAt={checkoutData.expires_at} />
            </div>
          )}
        </div>

        {/* Security Footer */}
        <SecurityFooter />
      </div>

      {/* Modals */}
      <ErrorModal />
      <SuccessModal />
      <CopySuccessModal />
      <WalletSelectorModal />
    </div>
  );
}
