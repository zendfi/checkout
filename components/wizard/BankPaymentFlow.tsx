'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { 
  Building2, 
  ArrowLeft, 
  Check, 
  Copy, 
  Mail,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

type BankFlowStep = 'sending-otp' | 'verify-otp' | 'bank-details' | 'waiting' | 'completed';

interface BankPaymentFlowProps {
  onBack: () => void;
  customerEmail: string;
}

export function BankPaymentFlow({ onBack, customerEmail }: BankPaymentFlowProps) {
  const {
    checkoutData,
    amount,
    bankOrder,
    setBankOrder,
    setSuccessModalOpen,
  } = useCheckoutStore();

  const [step, setStep] = useState<BankFlowStep>('sending-otp');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpValue = otp.join('');

  // Send OTP on mount
  useEffect(() => {
    if (!customerEmail || !checkoutData) return;
    
    const sendOtp = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await api.onrampInitiate({
          customer_email: customerEmail,
          fiat_amount: amount,
          payment_link_id: checkoutData.payment_link_id?.toString() || null,
        });
        setStep('verify-otp');
        setResendCooldown(60);
      } catch (err) {
        setError((err as Error).message || 'Failed to send verification code');
        setStep('verify-otp'); // Still allow manual retry
      } finally {
        setIsLoading(false);
      }
    };

    sendOtp();
  }, [customerEmail, checkoutData, amount]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Poll for payment completion when showing bank details
  useEffect(() => {
    if (step !== 'bank-details' || !bankOrder) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.onrampGetOrder(bankOrder.order_id);
        if (status.status === 'COMPLETED') {
          setStep('completed'); // Hide the waiting message
          setSuccessModalOpen(true);
          clearInterval(pollInterval);
        } else if (status.status === 'FAILED') {
          setError('Payment failed. Please try again.');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.warn('Status poll error:', err);
      }
    }, 10000); // Poll every 10 seconds (bank transfers take time)

    return () => clearInterval(pollInterval);
  }, [step, bankOrder, setSuccessModalOpen]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !checkoutData) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await api.onrampInitiate({
        customer_email: customerEmail,
        fiat_amount: amount,
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
      });
      setResendCooldown(60);
      setOtp(['', '', '', '']);
    } catch (err) {
      setError((err as Error).message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length < 4 || !checkoutData) return;

    setIsLoading(true);
    setError(null);
    try {
      const order = await api.onrampCreateOrder({
        customer_email: customerEmail,
        otp: otpValue,
        fiat_amount: amount,
        currency: 'USD',
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
        payment_intent_id: null,
        webhook_url: null,
      });
      setBankOrder(order);
      setStep('bank-details');
    } catch (err) {
      setError((err as Error).message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 4; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(d => !d);
      inputRefs.current[nextEmptyIndex === -1 ? 3 : nextEmptyIndex]?.focus();
    }
  };

  // Sending OTP screen
  if (step === 'sending-otp') {
    return (
      <div className="animate-slide-down">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Sending Verification Code</h4>
          <p className="text-xs text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  // OTP Verification screen
  if (step === 'verify-otp') {
    return (
      <div className="animate-slide-down">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Check Your Email</h4>
          <p className="text-xs text-gray-500">
            We sent a verification code to<br />
            <span className="font-medium text-gray-700">{customerEmail}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* OTP Input Grid */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 mb-2 block text-center">
            Enter verification code
          </label>
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                autoFocus={index === 0}
                className={`
                  w-11 h-12 text-center text-lg font-semibold
                  border-2 rounded-lg transition-all duration-150
                  focus:outline-none focus:ring-0
                  ${digit 
                    ? 'border-primary-DEFAULT bg-primary-50 text-primary-700' 
                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-primary-DEFAULT focus:bg-white'
                  }
                  ${error ? 'border-red-300 bg-red-50' : ''}
                `}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Paste from clipboard or type manually
          </p>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={onBack}
            className="btn btn-ghost flex-1 text-xs"
            disabled={isLoading}
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
          <button
            onClick={handleVerifyOtp}
            className="btn btn-primary flex-1"
            disabled={isLoading || otpValue.length < 4}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || isLoading}
            className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              <span className="flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Resend code
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Bank details screen with waiting indicator
  if (step === 'bank-details') {
    if (!bankOrder) return null;
    
    return (
      <div className="animate-slide-down">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Transfer to This Account</h4>
          <p className="text-xs text-gray-500">
            Send exactly <span className="font-semibold text-gray-900">₦{bankOrder.fiat_amount.toLocaleString()}</span> to complete your payment
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Bank Name</span>
            <span className="text-xs font-medium text-gray-900">{bankOrder.bank_name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Account Name</span>
            <span className="text-xs font-medium text-gray-900">{bankOrder.bank_account_name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-gray-900">
                {bankOrder.bank_account_number}
              </span>
              <button
                onClick={() => handleCopy(bankOrder.bank_account_number, 'account')}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {copied === 'account' ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Amount (NGN)</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-600">
                  ₦{bankOrder.fiat_amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleCopy(bankOrder.fiat_amount.toString(), 'amount')}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {copied === 'amount' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs font-medium text-blue-700">Waiting for your transfer...</span>
          </div>
          <p className="text-xs text-blue-600">
            We&apos;ll automatically confirm once we receive your payment. This usually takes 1-5 minutes.
          </p>
        </div>

        {/* Important notes */}
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <p className="flex items-start gap-1">
            <span className="text-amber-500">•</span>
            Transfer the exact amount shown above
          </p>
          <p className="flex items-start gap-1">
            <span className="text-amber-500">•</span>
            Use your bank app or USSD to transfer
          </p>
          <p className="flex items-start gap-1">
            <span className="text-amber-500">•</span>
            Account expires in 30 minutes
          </p>
        </div>

        <button
          onClick={onBack}
          className="btn btn-ghost w-full text-xs"
        >
          <ArrowLeft className="w-3 h-3" />
          Cancel & Go Back
        </button>
      </div>
    );
  }

  // Payment completed - show success state (modal is overlayed)
  if (step === 'completed') {
    return (
      <div className="animate-slide-down">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Payment Received!</h4>
          <p className="text-xs text-gray-500">Processing your order...</p>
        </div>
      </div>
    );
  }

  return null;
}
