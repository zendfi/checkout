'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCheckoutStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  getAvailableWallets,
  isMobileDevice,
  connectToWallet,
  getPhantomDeepLink,
  getSolflareDeepLink,
  getPhantomAppStoreUrl,
  getSolflareAppStoreUrl,
  getFundingGuideUrl,
  DetectedWallet,
} from '@/lib/wallet';
import { CheckIcon, WalletIcon, WarningIcon } from '@/components/icons';
import { Transaction } from '@solana/web3.js';

export function WalletTab() {
  const {
    activeTab,
    wallet,
    setWallet,
    checkoutData,
    amount,
    hasInsufficientBalance,
    setHasInsufficientBalance,
    balanceWarning,
    setBalanceWarning,
    isProcessing,
    setIsProcessing,
    processingMessage,
    setProcessingMessage,
    setError,
    setErrorModal,
    setWalletSelectorOpen,
    setSuccessModalOpen,
  } = useCheckoutStore();

  const [availableWallets, setAvailableWallets] = useState<DetectedWallet[]>([]);
  const [connectButtonText, setConnectButtonText] = useState('Connect Wallet');
  const [supportText, setSupportText] = useState('Supports Phantom, Solflare, Backpack, Glow & more');

  // Detect available wallets on mount
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);

    if (wallets.length > 0) {
      const walletNames = wallets.map((w) => w.name).join(', ');
      setConnectButtonText(
        wallets.length === 1
          ? `Connect ${wallets[0].name}`
          : `Connect Wallet (${wallets.length} detected)`
      );
      console.log('Detected wallets:', walletNames);
    } else if (isMobileDevice()) {
      setConnectButtonText('Open in Wallet App');
      setSupportText('Works with Phantom, Solflare & other mobile wallets');
      console.log('Mobile device detected - will use Solana Pay deep link');
    } else {
      setConnectButtonText('No Wallet Detected');
    }
  }, []);

  // Check wallet balance
  const checkWalletBalance = useCallback(async () => {
    if (!wallet?.publicKey || !checkoutData) return true;

    if (wallet.publicKey.length < 32 || wallet.publicKey.length > 44) {
      console.error('Invalid publicKey format in checkWalletBalance:', wallet.publicKey);
      return true;
    }

    try {
      const data = await api.checkBalance({
        wallet_address: wallet.publicKey,
        token: checkoutData.token,
        network: checkoutData.solana_network,
      });

      console.log('SOL Balance:', data.sol_balance);

      if (checkoutData.token !== 'SOL' && data.token_balance !== null) {
        const tokenBalance = data.token_balance;
        console.log(`${checkoutData.token} Balance:`, tokenBalance);

        if (tokenBalance < amount) {
          setHasInsufficientBalance(true);
          setBalanceWarning({
            title: `Insufficient ${checkoutData.token}`,
            message: `You need ${amount} ${checkoutData.token} but only have ${tokenBalance.toFixed(2)} ${checkoutData.token}.`,
            type: 'token',
          });
          return false;
        }
      }

      setHasInsufficientBalance(false);
      setBalanceWarning(null);
      return true;
    } catch (err) {
      console.error('Error checking balance:', err);
      return true;
    }
  }, [wallet, checkoutData, amount, setHasInsufficientBalance, setBalanceWarning]);

  // Check balance when wallet connects
  useEffect(() => {
    if (wallet?.publicKey) {
      checkWalletBalance();
    }
  }, [wallet?.publicKey, checkWalletBalance]);

  const handleConnectWallet = async () => {
    try {
      setError(null);

      if (availableWallets.length === 0 && isMobileDevice()) {
        showMobileWalletModal();
        return;
      }

      if (availableWallets.length === 0) {
        setError('No Solana wallet found. Please install Phantom, Solflare, Backpack, or another Solana wallet extension, then refresh this page.');
        return;
      }

      if (availableWallets.length > 1) {
        setWalletSelectorOpen(true);
        return;
      }

      await handleSelectWallet(availableWallets[0]);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  const handleSelectWallet = async (selectedWallet: DetectedWallet) => {
    try {
      const publicKey = await connectToWallet(selectedWallet);
      setWallet({
        name: selectedWallet.name,
        publicKey,
        provider: selectedWallet.provider,
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  const handleDisconnect = () => {
    if (wallet?.provider) {
      wallet.provider.disconnect?.();
    }
    setWallet(null);
    setBalanceWarning(null);
    setHasInsufficientBalance(false);

    // Reset connect button text
    const wallets = getAvailableWallets();
    if (wallets.length > 0) {
      setConnectButtonText(
        wallets.length === 1
          ? `Connect ${wallets[0].name}`
          : `Connect Wallet (${wallets.length} detected)`
      );
    }
  };

  const showMobileWalletModal = () => {
    setErrorModal({
      isOpen: true,
      icon: (
        <svg width="40" height="40" fill="none" stroke="#8866ff" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
          <path strokeWidth="2" d="M12 18h.01" />
        </svg>
      ),
      title: 'Choose Your Mobile Wallet',
      subtitle: 'Open this payment in your wallet app',
      body: (
        <div className="space-y-4">
          <p className="text-gray-600">
            You&apos;re on a mobile device. Choose how you&apos;d like to pay:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => openInPhantom()}
              className="w-full p-4 bg-purple-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              Open in Phantom
            </button>
            <button
              onClick={() => openInSolflare()}
              className="w-full p-4 bg-orange-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              Open in Solflare
            </button>
            <button
              onClick={() => window.location.href = checkoutData?.payment_url || ''}
              className="w-full p-4 bg-brand-green text-black rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              Other Wallet App
            </button>
          </div>
          <div className="info-box">
            Don&apos;t have a wallet? Download{' '}
            <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-brand-purple font-semibold">
              Phantom
            </a>{' '}
            or{' '}
            <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-brand-purple font-semibold">
              Solflare
            </a>{' '}
            from your app store.
          </div>
        </div>
      ),
      actionText: 'Cancel',
    });
  };

  const openInPhantom = () => {
    useCheckoutStore.getState().closeErrorModal();
    window.location.href = getPhantomDeepLink(window.location.href);

    setTimeout(() => {
      if (confirm('Phantom app not found. Would you like to install it?')) {
        window.location.href = getPhantomAppStoreUrl();
      }
    }, 2000);
  };

  const openInSolflare = () => {
    useCheckoutStore.getState().closeErrorModal();
    window.location.href = getSolflareDeepLink(window.location.href);

    setTimeout(() => {
      if (confirm('Solflare app not found. Would you like to install it?')) {
        window.location.href = getSolflareAppStoreUrl();
      }
    }, 2000);
  };

  const handlePayWithWallet = async () => {
    if (!wallet?.publicKey || !checkoutData) {
      setError('Please connect your wallet first');
      return;
    }

    if (wallet.publicKey.length < 32 || wallet.publicKey.length > 44) {
      setError('Invalid wallet address. Please reconnect your wallet.');
      handleDisconnect();
      return;
    }

    console.log('Processing payment with wallet:', wallet.publicKey);

    try {
      setError(null);
      setIsProcessing(true);
      setProcessingMessage('Building transaction...');

      // Build transaction
      const buildData = await api.buildTransaction(checkoutData.payment_id, {
        payer_wallet: wallet.publicKey,
        amount_override: checkoutData.allow_custom_amount ? amount : null,
        prefer_gasless: true,
      });

      const { transaction: transactionBase64, is_gasless: isGasless, requires_backend_submission: requiresBackendSubmission } = buildData;

      console.log('Transaction received from server');
      console.log('Network:', checkoutData.solana_network);
      console.log('Gasless mode:', isGasless);

      if (isGasless) {
        setProcessingMessage('⚡ Gasless - No SOL needed!');
        console.log('GASLESS MODE: Backend will pay transaction fees');
      } else {
        setProcessingMessage('Please sign in your wallet...');
      }

      // Decode transaction
      const transactionBuffer = Uint8Array.from(atob(transactionBase64), (c) => c.charCodeAt(0));
      const transaction = Transaction.from(transactionBuffer);

      let signature: string;
      let signedTransaction: Transaction | null = null;

      // Sign transaction
      if (isGasless) {
        console.log('Gasless mode: Requesting customer signature only...');
        signedTransaction = await wallet.provider.signTransaction(transaction);
        console.log('Customer signed gasless transaction');
      } else {
        const result = await wallet.provider.signAndSendTransaction(transaction);
        signature = result.signature;
        console.log('Transaction signed and sent:', signature);
      }

      setProcessingMessage(isGasless ? '⚡ Submitting transaction...' : 'Verifying transaction...');

      // Submit to backend
      if (requiresBackendSubmission && signedTransaction) {
        const serialized = signedTransaction.serialize();
        const base64 = btoa(String.fromCharCode(...Array.from(serialized)));
        await api.submitGaslessTransaction(checkoutData.payment_id, base64);
      } else if (signature!) {
        await api.submitTransaction(checkoutData.payment_id, signature!);
      }

      console.log('Transaction submitted for verification');
      setProcessingMessage('Verifying...');
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
      handlePaymentError(err as Error);
    }
  };

  const handlePaymentError = (err: Error) => {
    const errorMsg = (err.message || err.toString() || '').toLowerCase();

    if (errorMsg.includes('user rejected') || errorMsg.includes('user canceled') || errorMsg.includes('user denied')) {
      setErrorModal({
        isOpen: true,
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>,
        title: 'Transaction Cancelled',
        subtitle: 'You cancelled the transaction',
        body: <p>The transaction was cancelled in your wallet. No funds were sent.</p>,
        actionText: 'Try Again',
      });
    } else if (errorMsg.includes('insufficient') || errorMsg.includes('not enough')) {
      const token = checkoutData?.token || 'USDC';
      setErrorModal({
        isOpen: true,
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>,
        title: 'Insufficient Funds',
        subtitle: "You don't have enough crypto",
        body: (
          <div>
            <p>Your wallet doesn&apos;t have enough funds to complete this transaction.</p>
            <div className="modal-list">
              {token !== 'SOL' && (
                <div className="modal-list-item">
                  <span className="icon">💰</span>
                  <span><strong>{amount} {token}</strong> required for payment</span>
                </div>
              )}
              <div className="modal-list-item">
                <span className="icon">⚡</span>
                <span><strong>~0.005 SOL</strong> needed for transaction fees</span>
              </div>
            </div>
          </div>
        ),
        actionText: 'Add Funds',
        onAction: () => window.open(getFundingGuideUrl(token), '_blank'),
      });
    } else if (errorMsg.includes('blockhash') || errorMsg.includes('expired') || errorMsg.includes('timeout')) {
      setErrorModal({
        isOpen: true,
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>,
        title: 'Transaction Expired',
        subtitle: 'Please try again',
        body: <p>The transaction took too long and expired. This can happen during network congestion.</p>,
        actionText: 'Retry Payment',
      });
    } else {
      setErrorModal({
        isOpen: true,
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>,
        title: 'Payment Error',
        subtitle: 'Unable to complete payment',
        body: <p>We encountered an unexpected issue. Please try again.</p>,
        actionText: 'Try Again',
      });
    }
  };

  if (activeTab !== 'wallet') return null;

  const token = checkoutData?.token || 'USDC';

  return (
    <div className="tab-content animate-fade-in">
      {!wallet ? (
        <>
          <button
            className="btn btn-primary"
            onClick={handleConnectWallet}
            disabled={availableWallets.length === 0 && !isMobileDevice()}
          >
            <WalletIcon className="w-5 h-5" />
            <span>{connectButtonText}</span>
          </button>
          <p className="text-gray-400 text-xs mt-4 text-center">{supportText}</p>
        </>
      ) : (
        <div>
          <div className="text-green-500 text-sm mb-3 text-center font-medium flex items-center justify-center gap-1">
            {wallet.name} connected
            <CheckIcon className="w-4 h-4" />
          </div>

          {balanceWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <WarningIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <strong className="text-yellow-800">{balanceWarning.title}</strong>
                  <p className="text-yellow-700 text-sm mt-1">{balanceWarning.message}</p>
                  {balanceWarning.type === 'token' && (
                    <button
                      onClick={() => window.open(getFundingGuideUrl(token), '_blank')}
                      className="mt-2 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md"
                    >
                      Add Funds to Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            className={`btn ${hasInsufficientBalance ? 'btn-warning' : 'btn-primary'}`}
            onClick={handlePayWithWallet}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner" />
                {processingMessage}
              </>
            ) : hasInsufficientBalance ? (
              <>
                <WarningIcon className="w-4 h-4" />
                {balanceWarning?.title || 'Insufficient Balance'}
              </>
            ) : (
              `Pay $${amount.toFixed(2)} ${token}`
            )}
          </button>

          <button className="btn btn-secondary mt-3" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
