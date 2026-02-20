'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';

type OnrampStep = 'email' | 'bank-details' | 'under-review' | 'success';

// Clean, professional SVG icons
const Icons = {
  mail: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  bank: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  checkCircle: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  arrowLeft: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  lock: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  clock: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  mail2: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
};

export function OnrampCheckout() {
  const { checkoutData, amount, setBankOrder, bankOrder, setSuccessModalOpen } = useCheckoutStore();

  const [step, setStep] = useState<OnrampStep>('email');
  const [prevStep, setPrevStep] = useState<OnrampStep>('email');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pollStartTime, setPollStartTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps: OnrampStep[] = ['email', 'bank-details', 'under-review', 'success'];

  // Slide transition between steps
  const goToStep = (newStep: OnrampStep, direction?: 'left' | 'right') => {
    const currentIndex = steps.indexOf(step);
    const newIndex = steps.indexOf(newStep);
    const dir = direction || (newIndex > currentIndex ? 'left' : 'right');

    setSlideDirection(dir);
    setIsTransitioning(true);

    setTimeout(() => {
      setPrevStep(step);
      setStep(newStep);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  // Silent background polling for OTP processing and order creation
  const startBackgroundVerification = useCallback(async (sessionId: string) => {
    if (!checkoutData) return;

    setIsVerifying(true);
    setPollStartTime(Date.now());
    setRetryCount(0);

    // Set timeout for 90 seconds
    pollTimeoutRef.current = setTimeout(() => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsVerifying(false);
      setError('Verification is taking longer than expected. Please try again or contact support.');
    }, 90 * 1000);

    // Poll every 3 seconds
    const pollOrder = async () => {
      try {
        setRetryCount(prev => prev + 1);
        
        console.log(`[Onramp] Silent verification polling (attempt ${retryCount + 1})...`);
        
        const order = await api.onrampCreateOrder({
          customer_email: email,
          session_id: sessionId,
          fiat_amount: amount,
          currency: 'USD',
          payment_link_id: checkoutData.payment_link_id?.toString() || null,
          payment_intent_id: null,
          webhook_url: null,
          amount_ngn: checkoutData.amount_ngn,
          payer_service_charge: checkoutData.payer_service_charge,
        });

        // Success! OTP was processed
        console.log('[Onramp] Order created successfully!', order);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        
        setIsVerifying(false);
        setBankOrder(order);

        if (order.payment_id && checkoutData) {
          useCheckoutStore.setState(state => ({
            checkoutData: state.checkoutData ? {
              ...state.checkoutData,
              payment_id: order.payment_id!
            } : null
          }));
        }

        goToStep('bank-details');
      } catch (err: any) {
        // 202 means still waiting for OTP - keep polling
        if (err.status === 202) {
          console.log(`[Onramp] Still waiting for OTP verification (attempt ${retryCount + 1})...`);
          return;
        }

        // Other errors
        console.error('[Onramp] Error creating order:', err);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        
        setIsVerifying(false);
        setError(err.message || 'Failed to process verification. Please try again.');
      }
    };

    // Start polling immediately
    pollOrder();
    pollIntervalRef.current = setInterval(pollOrder, 3000);
  }, [checkoutData, email, amount, retryCount, setBankOrder]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  // Poll for payment completion
  useEffect(() => {
    if (step !== 'bank-details' || !bankOrder) return;

    setPollStartTime(Date.now());

    pollTimeoutRef.current = setTimeout(() => {
      goToStep('under-review');
    }, 15 * 60 * 1000); // 15 minutes

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.getPaymentStatus(bankOrder.payment_id || checkoutData?.payment_id || '');
        if (status.status === 'confirmed') {
          if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
          goToStep('success');
          setTimeout(() => setSuccessModalOpen(true), 800);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 8000);

    return () => {
      clearInterval(pollInterval);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
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
      // Initiate session
      const response = await api.onrampInitiate({
        customer_email: email,
        fiat_amount: amount,
        payment_link_id: checkoutData.payment_link_id?.toString() || null,
        amount_ngn: checkoutData.amount_ngn,
      });
      
      setSessionId(response.session_id);
      
      // Keep loading state and start silent background verification
      // Stay on email screen with loading indicator
      startBackgroundVerification(response.session_id);
    } catch (err) {
      setError((err as Error).message || 'Failed to initiate session');
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    if (navigator.vibrate) navigator.vibrate(30);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const serviceChargeNgn = (checkoutData?.payer_service_charge && checkoutData?.service_charge_ngn)
    ? checkoutData.service_charge_ngn
    : 0;
  const baseNgnAmount = checkoutData?.amount_ngn || Math.round(amount * 1500);
  const ngnAmount = baseNgnAmount + serviceChargeNgn;

  if (!checkoutData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="text-indigo-500">{Icons.loader}</div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Slide animation classes
  const getSlideClasses = () => {
    if (isTransitioning) {
      return slideDirection === 'left'
        ? 'translate-x-[-20px] opacity-0'
        : 'translate-x-[20px] opacity-0';
    }
    return 'translate-x-0 opacity-100';
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFBFC]">
      <div className="h-safe-top" />

      {/* Header */}
      <div className="flex-shrink-0 pt-6 sm:pt-8 pb-4 px-5">
        {/* Merchant */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white">
                {checkoutData.merchant_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700">{checkoutData.merchant_name}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            ₦{ngnAmount.toLocaleString()}
          </div>
          {serviceChargeNgn > 0 && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="text-xs text-gray-400">
                ₦{baseNgnAmount.toLocaleString()} + ₦{serviceChargeNgn.toLocaleString()} service fee
              </span>
            </div>
          )}
          {checkoutData.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto truncate">
              {checkoutData.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mt-4">
          {/* Only show 2 steps in progress: email and bank-details */}
          {['email', 'bank-details'].map((s, i) => {
            const visibleSteps = ['email', 'bank-details'];
            const currentIndex = visibleSteps.indexOf(step as 'email' | 'bank-details');
            const isActive = s === step;
            const isPast = currentIndex !== -1 && i < currentIndex;

            return (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-6 bg-gray-900'
                    : isPast
                      ? 'w-1.5 bg-gray-400'
                      : 'w-1.5 bg-gray-200'
                  }`}
              />
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-start justify-center px-5 py-4">
        <div
          className={`w-full max-w-[400px] transition-all duration-200 ease-out ${getSlideClasses()}`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

            {/* Email Step */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="p-5">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-600">
                    {Icons.mail}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Enter your email</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isVerifying ? 'Processing your payment details...' : 'Should be ready any second now'}
                  </p>
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
                      className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none transition-colors ${
                        emailError
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-gray-200 focus:border-gray-900 bg-white'
                        }`}
                      autoFocus
                      autoComplete="email"
                      inputMode="email"
                      disabled={isLoading || isVerifying}
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 mt-2">{emailError}</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-500">{Icons.loader}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700">Preparing payment details</p>
                          <p className="text-xs text-blue-600 mt-0.5">This takes just a few seconds...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isVerifying || !email.trim()}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-base font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {(isLoading || isVerifying) ? (
                      <>
                        <div className="text-white">{Icons.loader}</div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        Continue
                        {Icons.arrowRight}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}



            {/* Bank Details Step */}
            {step === 'bank-details' && bankOrder && (
              <div className="p-5">
                <div className="text-center mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-600">
                    {Icons.bank}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Complete transfer</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Send <span className="font-semibold text-gray-900">₦{(bankOrder.fiat_amount || 0).toLocaleString()}</span> to complete
                  </p>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium text-gray-900">{bankOrder.bank_name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Account Name</span>
                    <span className="font-medium text-gray-900 text-right max-w-[180px] truncate">
                      {bankOrder.bank_account_name || 'N/A'}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Account Number</span>
                      <button
                        onClick={() => handleCopy(bankOrder.bank_account_number || '', 'account')}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 active:scale-[0.98] transition-all"
                      >
                        <span className="text-base font-mono font-semibold text-gray-900">
                          {bankOrder.bank_account_number || 'N/A'}
                        </span>
                        <span className={copied === 'account' ? 'text-green-500' : 'text-gray-400'}>
                          {copied === 'account' ? Icons.check : Icons.copy}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Amount</span>
                      <button
                        onClick={() => handleCopy((bankOrder.fiat_amount || 0).toString(), 'amount')}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 active:scale-[0.98] transition-all"
                      >
                        <span className="text-base font-semibold text-gray-900">
                          ₦{(bankOrder.fiat_amount || 0).toLocaleString()}
                        </span>
                        <span className={copied === 'amount' ? 'text-green-500' : 'text-gray-400'}>
                          {copied === 'amount' ? Icons.check : Icons.copy}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-500">{Icons.loader}</div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Waiting for transfer</p>
                      <p className="text-xs text-blue-600 mt-0.5">We'll confirm once received</p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p>• Transfer the exact amount shown</p>
                  <p>• Use your bank app or USSD</p>
                  <p>• Account expires in 30 minutes</p>
                </div>
              </div>
            )}

            {/* Under Review Step */}
            {step === 'under-review' && (
              <div className="p-5">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
                    {Icons.clock}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Under Review</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We're still processing your bank transfer. This is taking longer than usual.
                  </p>
                </div>

                {/* What's Happening */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What's happening?</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Our team has been notified and is investigating your payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>We're coordinating with our payment partner to locate your transfer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>You'll receive an update via email within 24 hours</span>
                    </li>
                  </ul>
                </div>

                {/* Guarantee */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 mt-0.5">{Icons.checkCircle}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-900 mb-1">You're protected</h3>
                      <p className="text-sm text-green-800">
                        If we can't deliver your USDC, you'll receive a <strong>full refund</strong> to your bank account within 3-5 business days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    {Icons.mail2}
                    <span>Need help?</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact our support team if you have questions:
                  </p>
                  <a
                    href={`mailto:dispute@zendfi.tech?subject=Payment Review - ${bankOrder?.payment_id || ''}&body=Order ID: ${bankOrder?.payment_id || ''}%0AEmail: ${email}`}
                    className="block w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Email Support
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Reference: {bankOrder?.payment_id?.slice(0, 8) || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                  {Icons.checkCircle}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful</h2>
                <p className="text-sm text-gray-500">Thank you for your payment</p>

                <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  ₦{(bankOrder?.fiat_amount || 0).toLocaleString()} received
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pb-3 px-5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          {Icons.lock}
          <span>Secured by</span>
          <a href="https://zendfi.tech" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
            <img src="/img/zendfi-logo.png" alt="ZendFi" className="h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      <div className="h-safe-bottom" />
    </div>
  );
}
