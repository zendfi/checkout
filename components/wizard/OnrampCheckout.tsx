'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { 
  Mail, 
  ArrowRight, 
  Building2, 
  Check, 
  Copy, 
  Loader2,
  RefreshCw,
  Shield,
  ChevronLeft
} from 'lucide-react';

type OnrampStep = 'email' | 'otp' | 'bank-details' | 'success';

export function OnrampCheckout() {
  const { checkoutData, amount, setBankOrder, bankOrder, setSuccessModalOpen } = useCheckoutStore();
  
  const [step, setStep] = useState<OnrampStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = otp.join('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Poll for payment completion
  useEffect(() => {
    if (step !== 'bank-details' || !bankOrder) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.getPaymentStatus(bankOrder.payment_id || checkoutData?.payment_id || '');
        if (status.status === 'confirmed') {
          setStep('success');
          setTimeout(() => setSuccessModalOpen(true), 500);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [step, bankOrder, checkoutData, setSuccessModalOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Please enter your email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!checkoutData) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.onrampInitiate({
        customer_email: email,
        fiat_amount: amount,
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
        amount_ngn: checkoutData.amount_ngn,
      });
      setStep('otp');
      setResendCooldown(60);
    } catch (err) {
      setError((err as Error).message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      setOtp(pastedData.split(''));
      otpRefs.current[3]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length < 4 || !checkoutData) return;

    setIsLoading(true);
    setError(null);

    try {
      const order = await api.onrampCreateOrder({
        customer_email: email,
        otp: otpValue,
        fiat_amount: amount,
        currency: 'USD',
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
        payment_intent_id: null,
        webhook_url: null,
        amount_ngn: checkoutData.amount_ngn,
      });

      setBankOrder(order);

      // Update payment_id if returned
      if (order.payment_id && checkoutData) {
        useCheckoutStore.setState(state => ({
          checkoutData: state.checkoutData ? {
            ...state.checkoutData,
            payment_id: order.payment_id!
          } : null
        }));
      }

      setStep('bank-details');
    } catch (err) {
      setError((err as Error).message || 'Invalid verification code');
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !checkoutData) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.onrampInitiate({
        customer_email: email,
        fiat_amount: amount,
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
        amount_ngn: checkoutData.amount_ngn,
      });
      setResendCooldown(60);
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError((err as Error).message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpValue.length === 4 && step === 'otp') {
      handleVerifyOtp();
    }
  }, [otpValue, step]);

  // Get NGN amount - use stored amount_ngn or estimate from USD
  const ngnAmount = checkoutData?.amount_ngn || Math.round(amount * 1500);

  if (!checkoutData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[380px] mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          ₦{ngnAmount.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          {checkoutData.merchant_name}
        </div>
        {checkoutData.description && (
          <div className="text-xs text-gray-400 mt-1 truncate max-w-[280px] mx-auto">
            {checkoutData.description}
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        {['email', 'otp', 'bank-details', 'success'].map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s 
                ? 'w-6 bg-indigo-500' 
                : i < ['email', 'otp', 'bank-details', 'success'].indexOf(step)
                  ? 'w-1.5 bg-indigo-500'
                  : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="p-5 sm:p-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-indigo-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Enter your email</h2>
              <p className="text-xs text-gray-500 mt-1">We'll send a verification code</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                    emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  autoFocus
                  autoComplete="email"
                />
                {emailError && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="p-5 sm:p-6">
            <button
              onClick={() => setStep('email')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 -ml-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Verify your email</h2>
              <p className="text-xs text-gray-500 mt-1">
                Code sent to <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-red-600 text-center">{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-sm text-gray-600">Verifying...</span>
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-gray-400">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 mx-auto"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bank Details Step */}
        {step === 'bank-details' && bankOrder && (
          <div className="p-5 sm:p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Transfer to complete</h2>
              <p className="text-xs text-gray-500 mt-1">
                Send exactly <span className="font-bold text-gray-900">₦{bankOrder.fiat_amount.toLocaleString()}</span>
              </p>
            </div>

            {/* Bank Details Card */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Bank</span>
                <span className="text-xs font-medium text-gray-900">{bankOrder.bank_name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Account Name</span>
                <span className="text-xs font-medium text-gray-900 text-right max-w-[180px] truncate">
                  {bankOrder.bank_account_name}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-mono font-bold text-gray-900">
                      {bankOrder.bank_account_number}
                    </span>
                    <button
                      onClick={() => handleCopy(bankOrder.bank_account_number, 'account')}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                    >
                      {copied === 'account' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-green-600">
                      ₦{bankOrder.fiat_amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleCopy(bankOrder.fiat_amount.toString(), 'amount')}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors active:scale-95"
                    >
                      {copied === 'amount' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-700">Waiting for transfer...</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    We'll confirm automatically once received
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-[10px] text-gray-500">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Transfer exact amount shown</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-gray-500">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Use bank app or USSD</span>
              </div>
              <div className="flex items-start gap-2 text-[10px] text-gray-500">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Account expires in 30 minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Received!</h2>
            <p className="text-sm text-gray-500">Thank you for your payment</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-6 text-[10px] text-gray-400">
        <Shield className="w-3 h-3" />
        <span>Secured by ZendFi</span>
      </div>
    </div>
  );
}
