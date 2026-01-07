'use client';

import { useState, useEffect, useRef } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { CheckIcon } from '@/components/icons';

export function BankTab() {
  const {
    activeTab,
    checkoutData,
    amount,
    bankOrderId,
    setBankOrderId,
    bankOrder,
    setBankOrder,
    bankTransferStartTime,
    setBankTransferStartTime,
    setSuccessModalOpen,
  } = useCheckoutStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('0:00');
  
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (bankTransferStartTime && step === 'details') {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - bankTransferStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [bankTransferStartTime, step]);

  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.onrampInitiate({
        customer_email: email,
        fiat_amount: amount,
        payment_link_id: checkoutData?.payment_link_id || null,
      });

      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      console.error('OTP error:', err);
      setError((err as Error).message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setError('Please enter the 4-digit verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = await api.onrampCreateOrder({
        customer_email: email,
        otp,
        fiat_amount: amount,
        currency: checkoutData?.currency || 'USD',
        payment_link_id: checkoutData?.payment_link_id || null,
        payment_intent_id: null,
        webhook_url: null,
      });

      setBankOrderId(orderData.order_id);
      setBankOrder(orderData);
      setStep('details');
      setBankTransferStartTime(Date.now());
      
      startStatusPolling(orderData.order_id);
    } catch (err) {
      console.error('Verification error:', err);
      setError((err as Error).message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusPolling = (orderId: string) => {
    statusIntervalRef.current = setInterval(async () => {
      try {
        const order = await api.onrampGetOrder(orderId);

        if (order.status === 'COMPLETED') {
          if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
          }
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }

          setBankOrder(order);
          setTimeout(() => {
            setSuccessModalOpen(true);
          }, 1500);
        } else if (order.status === 'PROCESSING') {
          setBankOrder(order);
        }
      } catch (err) {
        console.error('Status polling error:', err);
      }
    }, 5000);
  };

  const handleManualRefresh = async () => {
    if (!bankOrderId) return;

    setIsLoading(true);

    try {
      const order = await api.onrampGetOrder(bankOrderId);
      setBankOrder(order);

      if (order.status === 'COMPLETED') {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        setTimeout(() => {
          setSuccessModalOpen(true);
        }, 1500);
      }
    } catch (err) {
      console.error('Manual refresh error:', err);
      setError('Failed to check status. Will retry automatically.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBankDetail = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  if (activeTab !== 'bank') return null;

  return (
    <div className="tab-content animate-fade-in">
      {/* Email Step */}
      {step === 'email' && (
        <div>
          <p className="text-gray-500 mb-4">
            Pay with your bank account. Funds convert to USDC automatically.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Sending...
              </>
            ) : otpSent ? (
              'Code Sent ✓'
            ) : (
              'Send Verification Code'
            )}
          </button>
        </div>
      )}

      {/* OTP Step */}
      {step === 'otp' && (
        <div className="animate-fade-in">
          <p className="text-gray-500 mb-4">
            Enter the verification code sent to {email}
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              className="form-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit code"
              maxLength={4}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Verifying...
              </>
            ) : (
              'Get Bank Details'
            )}
          </button>
        </div>
      )}

      {/* Bank Details Step */}
      {step === 'details' && bankOrder && (
        <div className="animate-fade-in">
          <div className="info-box mb-4 bg-indigo-50 border-indigo-200">
            <strong>📋 Bank Transfer Details</strong>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="mb-3">
              <div className="text-gray-500 text-xs mb-1">Bank Name</div>
              <div className="font-semibold text-gray-900">{bankOrder.bank_name}</div>
            </div>

            <div className="mb-3">
              <div className="text-gray-500 text-xs mb-1">Account Number</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-lg">
                  {bankOrder.bank_account_number}
                </span>
                <button
                  onClick={() => copyBankDetail(bankOrder.bank_account_number)}
                  className="btn btn-secondary py-1 px-2 text-xs w-auto"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-gray-500 text-xs mb-1">Account Name</div>
              <div className="font-semibold text-gray-900">{bankOrder.bank_account_name}</div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="text-gray-500 text-xs mb-1">Amount to Send</div>
              <div className="text-2xl font-bold text-brand-purple">
                {bankOrder.fiat_amount.toFixed(2)} NGN
              </div>
            </div>
          </div>

          <div className="info-box mb-4">
            <strong>Instructions:</strong>
            <ol className="mt-2 ml-5 list-decimal text-sm space-y-1">
              <li>Open your bank app</li>
              <li>Transfer the exact amount shown above</li>
              <li>Payment will auto-complete in 10-30 seconds</li>
            </ol>
          </div>

          <div className="info-box mb-4 bg-yellow-50 border-yellow-300">
            <strong>Tips:</strong>
            <ul className="mt-2 ml-5 list-disc text-sm space-y-1">
              <li>Use instant transfer if available</li>
              <li>Double-check the amount matches exactly</li>
              <li>Stay on this page to see when payment completes</li>
            </ul>
          </div>

          {/* Status Indicator */}
          <div className="text-center py-4">
            {bankOrder.status === 'COMPLETED' ? (
              <div className="flex flex-col items-center gap-2">
                <CheckIcon className="w-12 h-12 text-green-600" />
                <div className="text-green-600 font-semibold">Payment Confirmed!</div>
                <div className="text-gray-500 text-sm">
                  Completed in {elapsedTime}
                </div>
              </div>
            ) : (
              <>
                <div className="spinner-dark mx-auto" />
                <div className="text-gray-500 mt-2">
                  {bankOrder.status === 'PROCESSING'
                    ? `Processing your payment... (${elapsedTime})`
                    : `Waiting for bank transfer... (${elapsedTime})`}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  ⏱️ Usually takes 10-30 seconds
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="mt-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm hover:bg-gray-50"
                >
                  {isLoading ? '⏳ Checking...' : '🔄 Refresh Status'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message mt-4 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
