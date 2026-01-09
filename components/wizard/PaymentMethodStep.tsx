'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import { 
  Send, 
  Wallet, 
  Building2, 
  Pencil, 
  ChevronRight,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import { WalletIconGrid } from './WalletIconGrid';
import { QRCodeDisplay } from './QRCodeDisplay';
import { BankPaymentFlow } from './BankPaymentFlow';
import { 
  getAvailableWallets, 
  isMobileDevice, 
  connectToWallet,
  DetectedWallet 
} from '@/lib/wallet';
import { Transaction } from '@solana/web3.js';

type PaymentMethod = 'wallet' | 'qr' | 'bank' | null;

interface PaymentMethodStepProps {
  onBack: () => void;
  customerName?: string;
  customerEmail?: string;
}

export function PaymentMethodStep({ onBack, customerName, customerEmail }: PaymentMethodStepProps) {
  const {
    checkoutData,
    amount,
    wallet,
    setWallet,
    setSuccessModalOpen,
    setErrorModal,
    isProcessing,
    setIsProcessing,
    setProcessingMessage,
    setHasInsufficientBalance,
    setBalanceWarning,
    setWalletSelectorOpen,
  } = useCheckoutStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  // Wallet balance check
  const checkWalletBalance = useCallback(async () => {
    if (!wallet?.publicKey || !checkoutData) return true;

    try {
      const data = await api.checkBalance({
        wallet_address: wallet.publicKey,
        token: checkoutData.token,
        network: checkoutData.solana_network,
      });

      if (checkoutData.token !== 'SOL' && data.token_balance !== null) {
        if (data.token_balance < amount) {
          setHasInsufficientBalance(true);
          setBalanceWarning({
            title: `Insufficient ${checkoutData.token}`,
            message: `You need ${amount} ${checkoutData.token} but only have ${data.token_balance.toFixed(2)} ${checkoutData.token}.`,
            type: 'token',
          });
          return false;
        }
      }

      setHasInsufficientBalance(false);
      setBalanceWarning(null);
      return true;
    } catch (err) {
      console.error('Balance check error:', err);
      return true;
    }
  }, [wallet, checkoutData, amount, setHasInsufficientBalance, setBalanceWarning]);

  const handleWalletSelect = async (selectedWallet: DetectedWallet | null) => {
    if (!selectedWallet) {
      if (availableWallets.length === 0 && isMobileDevice()) {
        return;
      }
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
      setSelectedMethod('wallet');
    } catch (err) {
      console.error('Wallet connection error:', err);
      setErrorModal({
        isOpen: true,
        icon: <Wallet className="w-6 h-6" />,
        title: 'Connection Failed',
        subtitle: 'Could not connect to your wallet',
        body: <p className="text-gray-600">{(err as Error).message}</p>,
        actionText: 'Try Again',
      });
    }
  };

  const handlePayment = async () => {
    if (!wallet?.publicKey || !checkoutData) return;

    const hasBalance = await checkWalletBalance();
    if (!hasBalance) return;

    setIsProcessing(true);
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

      setProcessingMessage('Submitting transaction...');

      const serialized = signedTx.serialize();
      const base64Tx = btoa(String.fromCharCode(...serialized));

      await api.submitGaslessTransaction(checkoutData.payment_id, base64Tx);

      setProcessingMessage('Confirming on blockchain...');
      
      // Poll for confirmation (timeout after 60 seconds)
      const startTime = Date.now();
      const maxWaitTime = 60000; // 60 seconds
      
      while (Date.now() - startTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const status = await api.getPaymentStatus(checkoutData.payment_id);
          
          if (status.status === 'confirmed') {
            setSuccessModalOpen(true);
            setIsProcessing(false);
            return;
          }
          
          if (status.status === 'failed' || status.status === 'expired') {
            throw new Error(`Payment ${status.status}`);
          }
        } catch (pollErr) {
          console.warn('Status poll error:', pollErr);
          // Continue polling on network errors
        }
      }
      
      // Timeout - but transaction might still confirm
      setIsProcessing(false);
      setProcessingMessage('');
      
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      setErrorModal({
        isOpen: true,
        icon: <Wallet className="w-6 h-6" />,
        title: 'Payment Failed',
        subtitle: 'There was an error processing your payment',
        body: <p className="text-gray-600">{(err as Error).message}</p>,
        actionText: 'Try Again',
      });
    }
  };

  const handleDisconnectWallet = () => {
    if (wallet?.provider) {
      wallet.provider.disconnect?.();
    }
    setWallet(null);
    setBalanceWarning(null);
    setHasInsufficientBalance(false);
    setSelectedMethod(null);
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Payment Summary Card */}
      <div className="summary-card">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-semibold text-gray-900">Payment Details</h4>
          <button
            onClick={onBack}
            className="text-xs text-primary-DEFAULT hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
        
        <div className="space-y-0">
          <div className="summary-row">
            <span className="summary-label">Amount</span>
            <span className="summary-value font-semibold">
              ${amount.toFixed(2)}
            </span>
          </div>
          {customerName && (
            <div className="summary-row">
              <span className="summary-label">Full Name</span>
              <span className="summary-value">{customerName}</span>
            </div>
          )}
          {customerEmail && (
            <div className="summary-row">
              <span className="summary-label">Email</span>
              <span className="summary-value text-xs">{customerEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Funds Section - Card 1 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="section-title">Transfer Funds</h3>

        {/* Wallet Connected State */}
        {wallet ? (
          <div className="space-y-3">
            <div className="payment-option selected">
              <div className="payment-option-icon">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-xs">{wallet.name}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
                </p>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Disconnect
              </button>
            </div>

            <button
              onClick={handlePayment}
              className="btn btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ${amount.toFixed(2)}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : selectedMethod === 'qr' && checkoutData ? (
          /* Wallet Transfer Slide-in Card */
          <div className="animate-slide-down">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white rounded-lg border border-gray-100">
                <QRCodeDisplay 
                  value={checkoutData.payment_url} 
                  size={160}
                />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mb-3">
              Scan with your Solana wallet app
            </p>
            
            {/* Wallet Address */}
            <div className="bg-gray-50 rounded-md p-2 mb-3">
              <p className="text-[10px] text-gray-500 mb-1 text-center">Wallet Address</p>
              <p className="text-[11px] font-mono text-gray-700 text-center break-all">
                {checkoutData.wallet_address}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMethod(null)}
                className="btn btn-ghost flex-1 text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(checkoutData.wallet_address);
                  setAddressCopied(true);
                  setTimeout(() => setAddressCopied(false), 2000);
                }}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                {addressCopied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Address
                  </>
                )}
              </button>
            </div>
          </div>
        ) : selectedMethod === 'bank' && checkoutData?.onramp && customerEmail ? (
          /* Bank Transfer Flow */
          <BankPaymentFlow 
            onBack={() => setSelectedMethod(null)} 
            customerEmail={customerEmail}
          />
        ) : (
          /* Default - Show payment method options */
          <>
            {/* Wallet Transfer Option */}
            <button
              onClick={() => setSelectedMethod('qr')}
              className="payment-option w-full text-left mb-3"
            >
              <div className="payment-option-icon">
                <Send className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="payment-option-title">Wallet Transfer</p>
                <p className="payment-option-subtitle">Scan QR or copy address</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Bank Transfer Option (if onramp enabled) */}
            {checkoutData?.onramp && (
              <button
                onClick={() => setSelectedMethod('bank')}
                className="payment-option w-full text-left"
              >
                <div className="payment-option-icon">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="payment-option-title">Pay with Bank</p>
                  <p className="payment-option-subtitle">Transfer directly from your bank</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Connect Wallet Section - Card 2 (only show when not in slide-in view) */}
      {!wallet && !selectedMethod && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">Connect Wallet</h4>
          <WalletIconGrid onWalletClick={handleWalletSelect} showMore />
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-ghost w-full text-xs"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Personal Information
      </button>
    </div>
  );
}
