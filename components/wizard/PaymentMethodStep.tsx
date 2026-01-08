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
  QrCode,
  ArrowLeft
} from 'lucide-react';
import { WalletIconGrid } from './WalletIconGrid';
import { TokenIconRow } from './TokenIconRow';
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

      setProcessingMessage('Verifying payment...');
      // Status polling will handle the rest
    } catch (err) {
      console.error('Payment error:', err);
      setErrorModal({
        isOpen: true,
        icon: <Wallet className="w-6 h-6" />,
        title: 'Payment Failed',
        subtitle: 'There was an error processing your payment',
        body: <p className="text-gray-600">{(err as Error).message}</p>,
        actionText: 'Try Again',
      });
    } finally {
      setIsProcessing(false);
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
    <div className="animate-fade-in space-y-6">
      {/* Payment Summary Card */}
      <div className="summary-card">
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-sm font-semibold text-gray-900">Payment Details</h4>
          <button
            onClick={onBack}
            className="text-sm text-primary-DEFAULT hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        
        <div className="space-y-0">
          <div className="summary-row">
            <span className="summary-label">Amount</span>
            <span className="summary-value font-semibold text-lg">
              ${amount.toFixed(2)} USD
            </span>
          </div>
          {customerName && (
            <div className="summary-row">
              <span className="summary-label">Name</span>
              <span className="summary-value">{customerName}</span>
            </div>
          )}
          {customerEmail && (
            <div className="summary-row">
              <span className="summary-label">Email</span>
              <span className="summary-value">{customerEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Funds Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Funds</h3>

        {/* Wallet Connected State */}
        {wallet ? (
          <div className="space-y-4">
            <div className="payment-option selected">
              <div className="payment-option-icon">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{wallet.name}</p>
                <p className="text-sm text-gray-500 font-mono">
                  {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-4)}
                </p>
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="text-sm text-gray-500 hover:text-gray-700"
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
        ) : (
          <>
            {/* Wallet Transfer Option */}
            <button
              onClick={() => setSelectedMethod(selectedMethod === 'qr' ? null : 'qr')}
              className={`payment-option w-full text-left mb-4 ${selectedMethod === 'qr' ? 'selected' : ''}`}
            >
              <div className="payment-option-icon">
                <Send className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Wallet Transfer</p>
                <div className="mt-2">
                  <TokenIconRow tokens={['USDC', 'USDT', 'SOL']} maxVisible={5} />
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* QR Code Section (expanded) */}
            {selectedMethod === 'qr' && checkoutData && (
              <div className="animate-slide-down mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="qr-container">
                  <img
                    src={checkoutData.qr_code}
                    alt="Payment QR Code"
                    className="qr-code bg-white"
                  />
                </div>
                <p className="text-center text-sm text-gray-500 mb-3">
                  Scan with your Solana wallet app
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(checkoutData.wallet_address);
                    }}
                    className="btn btn-secondary text-sm py-2 px-4 w-auto"
                  >
                    Copy Address
                  </button>
                </div>
              </div>
            )}

            {/* OR Divider */}
            <div className="divider">
              <span className="divider-text">or</span>
            </div>

            {/* Connect Wallet Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Connect Wallet</h4>
              <WalletIconGrid onWalletClick={handleWalletSelect} showMore />
            </div>

            {/* Bank Transfer Option (if onramp enabled) */}
            {checkoutData?.onramp && (
              <>
                <div className="divider">
                  <span className="divider-text">or</span>
                </div>

                <button
                  onClick={() => setSelectedMethod('bank')}
                  className={`payment-option w-full text-left ${selectedMethod === 'bank' ? 'selected' : ''}`}
                >
                  <div className="payment-option-icon">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pay with Bank</p>
                    <p className="text-sm text-gray-500">Transfer directly from your bank account</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-ghost w-full"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Personal Information
      </button>
    </div>
  );
}
