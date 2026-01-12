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
  ChevronLeft,
  Sparkles
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
  const [isAnimating, setIsAnimating] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpValue = otp.join('');

  // Animate step transitions
  const animateToStep = (newStep: OnrampStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 150);
  };

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
          animateToStep('success');
          setTimeout(() => setSuccessModalOpen(true), 800);
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
      animateToStep('otp');
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

      animateToStep('bank-details');
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
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Safe area top spacer */}
      <div className="h-safe-top" />
      
      {/* Header Section - Fixed at top on mobile */}
      <div className="flex-shrink-0 pt-6 sm:pt-10 pb-4 px-4">
        {/* Merchant Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {checkoutData.merchant_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700">{checkoutData.merchant_name}</span>
          </div>
        </div>

        {/* Amount - Large and prominent */}
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            ₦{ngnAmount.toLocaleString()}
          </div>
          {checkoutData.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto truncate">
              {checkoutData.description}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {['email', 'otp', 'bank-details', 'success'].map((s, i) => {
            const stepIndex = ['email', 'otp', 'bank-details', 'success'].indexOf(step);
            const isActive = s === step;
            const isPast = i < stepIndex;
            
            return (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-500 ease-out ${
                  isActive 
                    ? 'w-8 bg-indigo-500' 
                    : isPast
                      ? 'w-2 bg-indigo-400'
                      : 'w-2 bg-gray-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Content - Centered and grows to fill space */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div 
          className={`w-full max-w-[400px] transition-all duration-150 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            
            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Mail className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Enter your email</h2>
                  <p className="text-sm text-gray-500 mt-1">We'll send a quick verification code</p>
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
                      className={`w-full px-4 py-4 text-base border-2 rounded-2xl focus:outline-none focus:ring-0 transition-all ${
                        emailError 
                          ? 'border-red-300 bg-red-50/50' 
                          : 'border-gray-100 focus:border-indigo-500 bg-gray-50/50 focus:bg-white'
                      }`}
                      autoFocus
                      autoComplete="email"
                      inputMode="email"
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 mt-2 ml-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500" />
                        {emailError}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-base font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:shadow-none active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="p-6 sm:p-8">
                <button
                  onClick={() => animateToStep('email')}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 -ml-1 active:scale-95 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Shield className="w-7 h-7 text-green-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    We sent a code to <span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>

                <div className="space-y-5">
                  {/* OTP Inputs - Larger for mobile */}
                  <div className="flex justify-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold border-2 rounded-2xl transition-all focus:outline-none ${
                          digit 
                            ? 'border-indigo-500 bg-indigo-50/50' 
                            : 'border-gray-100 bg-gray-50/50 focus:border-indigo-500 focus:bg-white'
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex items-center justify-center gap-3 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span className="text-sm font-medium text-gray-600">Verifying...</span>
                    </div>
                  )}

                  {/* Resend */}
                  <div className="text-center pt-2">
                    {resendCooldown > 0 ? (
                      <p className="text-sm text-gray-400">
                        Resend code in <span className="font-medium text-gray-600">{resendCooldown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-2 mx-auto active:scale-95 transition-transform"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details Step */}
            {step === 'bank-details' && bankOrder && (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Building2 className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Complete your transfer</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Send exactly <span className="font-bold text-green-600">₦{bankOrder.fiat_amount.toLocaleString()}</span>
                  </p>
                </div>

                {/* Bank Details Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 space-y-4 mb-5 border border-gray-100">
                  {/* Bank Name */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Bank</span>
                    <span className="text-sm font-semibold text-gray-900">{bankOrder.bank_name}</span>
                  </div>
                  
                  {/* Account Name */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Name</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-[200px] truncate">
                      {bankOrder.bank_account_name}
                    </span>
                  </div>

                  {/* Account Number - Prominent */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Account Number</span>
                      <button
                        onClick={() => handleCopy(bankOrder.bank_account_number, 'account')}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 active:scale-95 transition-all shadow-sm"
                      >
                        <span className="text-lg font-mono font-bold text-gray-900 tracking-wide">
                          {bankOrder.bank_account_number}
                        </span>
                        {copied === 'account' ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Amount - Copyable */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Amount</span>
                      <button
                        onClick={() => handleCopy(bankOrder.fiat_amount.toString(), 'amount')}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200 hover:border-green-300 active:scale-95 transition-all"
                      >
                        <span className="text-lg font-bold text-green-600">
                          ₦{bankOrder.fiat_amount.toLocaleString()}
                        </span>
                        {copied === 'amount' ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-green-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waiting indicator */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Waiting for your transfer</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        We'll confirm automatically once received
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="space-y-2">
                  {[
                    'Transfer the exact amount shown',
                    'Use your bank app or USSD code',
                    'Account expires in 30 minutes'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="p-8 sm:p-10 text-center">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                  <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-sm text-gray-500">Thank you for your payment</p>
                
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">₦{bankOrder?.fiat_amount.toLocaleString()} received</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 pb-6 pt-4 px-4">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured by <span className="font-medium text-gray-500">ZendFi</span></span>
        </div>
      </div>
      
      {/* Safe area bottom spacer */}
      <div className="h-safe-bottom" />
    </div>
  );
}
