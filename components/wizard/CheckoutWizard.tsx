'use client';

import { useState } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { ProgressIndicator } from './ProgressIndicator';
import { CheckoutHeaderNew } from './CheckoutHeaderNew';
import { PersonalInfoStep } from './PersonalInfoStep';
import { PaymentMethodStep } from './PaymentMethodStep';
import { SecurityFooter } from './SecurityFooter';
import { Timer } from '../Timer';
import { ErrorModal } from '../modals/ErrorModal';
import { SuccessModal } from '../modals/SuccessModal';
import { CopySuccessModal } from '../modals/CopySuccessModal';
import { WalletSelectorModal } from '../modals/WalletSelectorModal';

interface CheckoutWizardProps {
  merchantName: string;
  network?: string;
  expiresAt: string;
}

export function CheckoutWizard({ merchantName, network, expiresAt }: CheckoutWizardProps) {
  const { checkoutData, paymentStatus } = useCheckoutStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<{ name?: string; email?: string }>({});

  const handleStep1Complete = () => {
    // Store customer info for summary display
    // In a real implementation, you might get this from form state or store
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  // Check if payment is completed
  const isCompleted = paymentStatus?.status === 'confirmed';
  const isExpired = new Date(expiresAt) < new Date();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="card max-w-[480px] w-full animate-slide-up">
        {/* Header */}
        <CheckoutHeaderNew merchantName={merchantName} network={network} />

        {/* Progress Indicator */}
        <div className="px-6 border-b border-gray-100">
          <ProgressIndicator currentStep={currentStep} totalSteps={2} />
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <PersonalInfoStep onContinue={handleStep1Complete} />
          )}

          {currentStep === 2 && (
            <PaymentMethodStep
              onBack={handleBackToStep1}
              customerName={customerInfo.name}
              customerEmail={customerInfo.email}
            />
          )}

          {/* Timer (only show on step 2) */}
          {currentStep === 2 && !isCompleted && !isExpired && (
            <div className="mt-6">
              <Timer expiresAt={expiresAt} />
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
