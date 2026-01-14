'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { QRCodeDisplay } from './QRCodeDisplay';
import { 
  getAvailableWallets, 
  isMobileDevice, 
  connectToWallet,
  DetectedWallet 
} from '@/lib/wallet';
import { Transaction } from '@solana/web3.js';

type CryptoStep = 'info' | 'method' | 'wallet-pay' | 'qr-pay' | 'success';

// Clean, professional SVG icons
const Icons = {
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  mail: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  wallet: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  ),
  qrCode: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
  disconnect: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.181 8.68a4.503 4.503 0 011.903 6.405m-9.768-2.782L3.56 14.06a4.5 4.5 0 006.364 6.364l3.536-3.536m1.414-10.607l1.757-1.757a4.5 4.5 0 016.364 6.364l-4.243 4.243a4.5 4.5 0 01-6.364 0l-1.414-1.414" />
    </svg>
  ),
};

export function CryptoCheckout() {
  const { 
    checkoutData, 
    amount, 
    setAmount,
    wallet,
    setWallet,
    setSuccessModalOpen,
    setErrorModal,
    setWalletSelectorOpen,
  } = useCheckoutStore();
  
  const [step, setStep] = useState<CryptoStep>('info');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);
  const [processingMessage, setProcessingMessage] = useState('');
  
  const steps: CryptoStep[] = ['info', 'method', 'wallet-pay', 'qr-pay', 'success'];

  // Initialize
  useEffect(() => {
    if (checkoutData?.amount_usd && amount === 0) {
      setAmount(checkoutData.amount_usd);
    }
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, [checkoutData, amount, setAmount]);

  // Slide transition
  const goToStep = (newStep: CryptoStep, direction?: 'left' | 'right') => {
    const currentIndex = steps.indexOf(step);
    const newIndex = steps.indexOf(newStep);
    const dir = direction || (newIndex > currentIndex ? 'left' : 'right');
    
    setSlideDirection(dir);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setStep(newStep);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
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

    if (!checkoutData?.payment_id) return;

    setIsLoading(true);

    try {
      const customerData: { email: string; name?: string } = { email };
      if (name.trim()) customerData.name = name.trim();
      
      await api.submitCustomerInfo(checkoutData.payment_id, customerData);
      goToStep('method');
    } catch (err) {
      setEmailError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async (selectedWallet?: DetectedWallet) => {
    if (!selectedWallet) {
      if (availableWallets.length === 0 && isMobileDevice()) return;
      if (availableWallets.length > 1) {
        setWalletSelectorOpen(true);
        return;
      }
      if (availableWallets.length === 1) {
        selectedWallet = availableWallets[0];
      } else {
        return;
      }
    }

    try {
      const publicKey = await connectToWallet(selectedWallet);
      setWallet({
        name: selectedWallet.name,
        publicKey,
        provider: selectedWallet.provider,
      });
      goToStep('wallet-pay');
    } catch (err) {
      setErrorModal({
        isOpen: true,
        icon: <span className="text-gray-600">{Icons.wallet}</span>,
        title: 'Connection Failed',
        subtitle: 'Could not connect to your wallet',
        body: <p className="text-gray-600">{(err as Error).message}</p>,
        actionText: 'Try Again',
      });
    }
  };

  const handleWalletPayment = async () => {
    if (!wallet?.publicKey || !checkoutData) return;

    setIsLoading(true);
    setProcessingMessage('Building transaction...');

    try {
      const buildResponse = await api.buildTransaction(checkoutData.payment_id, {
        payer_wallet: wallet.publicKey,
        amount_override: checkoutData.allow_custom_amount ? amount : null,
        prefer_gasless: true,
      });

      setProcessingMessage('Awaiting signature...');

      const txBytes = Uint8Array.from(atob(buildResponse.transaction), (c) => c.charCodeAt(0));
      const transaction = Transaction.from(txBytes);
      const signedTx = await wallet.provider.signTransaction(transaction);

      setProcessingMessage('Submitting...');

      const serialized = signedTx.serialize();
      const base64Tx = btoa(String.fromCharCode(...serialized));
      await api.submitGaslessTransaction(checkoutData.payment_id, base64Tx);

      setProcessingMessage('Confirming...');
      
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const status = await api.getPaymentStatus(checkoutData.payment_id);
        if (status.status === 'confirmed') {
          goToStep('success');
          setTimeout(() => setSuccessModalOpen(true), 500);
          setIsLoading(false);
          return;
        }
        if (status.status === 'failed' || status.status === 'expired') {
          throw new Error(`Payment ${status.status}`);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setProcessingMessage('');
      setErrorModal({
        isOpen: true,
        icon: <span className="text-gray-600">{Icons.wallet}</span>,
        title: 'Payment Failed',
        subtitle: 'There was an error processing your payment',
        body: <p className="text-gray-600">{(err as Error).message}</p>,
        actionText: 'Try Again',
      });
    }
  };

  const handleDisconnect = () => {
    if (wallet?.provider) wallet.provider.disconnect?.();
    setWallet(null);
    goToStep('method', 'right');
  };

  const handleCopy = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    if (navigator.vibrate) navigator.vibrate(30);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const getSlideClasses = () => {
    if (isTransitioning) {
      return slideDirection === 'left' 
        ? 'translate-x-[-20px] opacity-0' 
        : 'translate-x-[20px] opacity-0';
    }
    return 'translate-x-0 opacity-100';
  };

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

  const currentStepIndex = () => {
    if (step === 'info') return 0;
    if (step === 'method' || step === 'wallet-pay' || step === 'qr-pay') return 1;
    return 2;
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FAFBFC]">
      <div className="h-safe-top" />
      
      {/* Header */}
      <div className="flex-shrink-0 pt-8 sm:pt-12 pb-6 px-5">
        {/* Merchant */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100">
            <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white">
                {checkoutData.merchant_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700">{checkoutData.merchant_name}</span>
            {(checkoutData.solana_network === 'devnet' || checkoutData.solana_network === 'testnet') && (
              <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Testnet
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center">
          <div className="text-[40px] sm:text-5xl font-semibold text-gray-900 tracking-tight">
            ${amount.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-1">{checkoutData.token} on Solana</p>
          {checkoutData.description && (
            <p className="text-sm text-gray-400 mt-2 max-w-[280px] mx-auto truncate">
              {checkoutData.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => {
            const current = currentStepIndex();
            const isActive = i === current;
            const isPast = i < current;
            
            return (
              <div
                key={i}
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
      <div className="flex-1 flex items-start sm:items-center justify-center px-5 py-4">
        <div 
          className={`w-full max-w-[400px] transition-all duration-200 ease-out ${getSlideClasses()}`}
        >
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            
            {/* Info Step */}
            {step === 'info' && (
              <form onSubmit={handleInfoSubmit} className="p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                    {Icons.user}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Your details</h2>
                  <p className="text-sm text-gray-500 mt-1">We'll send a receipt to your email</p>
                </div>

                <div className="space-y-3">
                  {/* Name */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {Icons.user}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name (optional)"
                      className="w-full pl-11 pr-4 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {Icons.mail}
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="Email address"
                        className={`w-full pl-11 pr-4 py-3.5 text-base border rounded-xl focus:outline-none transition-colors ${
                          emailError ? 'border-red-200 bg-red-50/50' : 'border-gray-200 focus:border-gray-900'
                        }`}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-red-500 mt-2">{emailError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-base font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <div className="text-white">{Icons.loader}</div>
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

            {/* Method Selection Step */}
            {step === 'method' && (
              <div className="p-6">
                <button
                  onClick={() => goToStep('info', 'right')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
                >
                  {Icons.arrowLeft}
                  <span>Back</span>
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-base font-semibold text-gray-900">Choose payment method</h2>
                  <p className="text-sm text-gray-500 mt-1">Pay with your Solana wallet</p>
                </div>

                <div className="space-y-3">
                  {/* Connect Wallet */}
                  <button
                    onClick={() => handleWalletConnect()}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-gray-700 border border-gray-100">
                      {Icons.wallet}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Connect Wallet</p>
                      <p className="text-xs text-gray-500 mt-0.5">Phantom, Solflare, Backpack...</p>
                    </div>
                    <span className="text-gray-400">{Icons.chevronRight}</span>
                  </button>

                  {/* QR Code / Manual */}
                  <button
                    onClick={() => goToStep('qr-pay')}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                  >
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-gray-700 border border-gray-100">
                      {Icons.qrCode}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Scan QR Code</p>
                      <p className="text-xs text-gray-500 mt-0.5">Use mobile wallet app</p>
                    </div>
                    <span className="text-gray-400">{Icons.chevronRight}</span>
                  </button>
                </div>

                {/* Available Wallets */}
                {availableWallets.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-3">Detected wallets</p>
                    <div className="flex flex-wrap gap-2">
                      {availableWallets.slice(0, 4).map((w) => (
                        <button
                          key={w.name}
                          onClick={() => handleWalletConnect(w)}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {w.icon && (
                            <img src={w.icon} alt={w.name} className="w-5 h-5 rounded" />
                          )}
                          <span className="text-sm font-medium text-gray-700">{w.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Pay Step */}
            {step === 'wallet-pay' && wallet && (
              <div className="p-6">
                <button
                  onClick={() => goToStep('method', 'right')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
                >
                  {Icons.arrowLeft}
                  <span>Back</span>
                </button>

                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-600">
                    {Icons.wallet}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Confirm payment</h2>
                </div>

                {/* Connected Wallet */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-600 border border-gray-100">
                        {Icons.wallet}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{wallet.name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {Icons.disconnect}
                    </button>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleWalletPayment}
                  disabled={isLoading}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white text-base font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="text-white">{Icons.loader}</div>
                      <span>{processingMessage || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      Pay ${amount.toFixed(2)}
                      {Icons.arrowRight}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  You'll be asked to sign in your wallet
                </p>
              </div>
            )}

            {/* QR Pay Step */}
            {step === 'qr-pay' && (
              <div className="p-6">
                <button
                  onClick={() => goToStep('method', 'right')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
                >
                  {Icons.arrowLeft}
                  <span>Back</span>
                </button>

                <div className="text-center mb-5">
                  <h2 className="text-base font-semibold text-gray-900">Scan to pay</h2>
                  <p className="text-sm text-gray-500 mt-1">Use your Solana wallet app</p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100">
                    <QRCodeDisplay value={checkoutData.payment_url} size={180} />
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Or send to this address</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono text-gray-700 truncate flex-1">
                      {checkoutData.wallet_address}
                    </p>
                    <button
                      onClick={() => handleCopy(checkoutData.wallet_address, 'address')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 active:scale-[0.98] transition-all text-sm"
                    >
                      {copied === 'address' ? (
                        <span className="text-green-500">{Icons.check}</span>
                      ) : (
                        <span className="text-gray-400">{Icons.copy}</span>
                      )}
                      <span className="text-gray-700">{copied === 'address' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Amount to send */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-sm text-blue-700">
                    Send exactly <span className="font-semibold">${amount.toFixed(2)} {checkoutData.token}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">We'll confirm once received</p>
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
                  ${amount.toFixed(2)} received
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
          <img src="/img/zendfi-logo.png" alt="ZendFi" className="h-3.5 opacity-80" />
        </div>
      </div>
      
      <div className="h-safe-bottom" />
    </div>
  );
}
