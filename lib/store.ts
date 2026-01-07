import { create } from 'zustand';
import { HostedCheckoutData, PaymentStatus, OnrampOrderResponse } from './types';

interface WalletInfo {
  name: string;
  publicKey: string;
  provider: any;
}

interface CheckoutState {
  // Checkout data
  checkoutData: HostedCheckoutData | null;
  setCheckoutData: (data: HostedCheckoutData | null) => void;
  
  // Amount (for PWYW)
  amount: number;
  setAmount: (amount: number) => void;
  
  // Active tab
  activeTab: 'wallet' | 'qr' | 'bank';
  setActiveTab: (tab: 'wallet' | 'qr' | 'bank') => void;
  
  // Wallet connection
  wallet: WalletInfo | null;
  setWallet: (wallet: WalletInfo | null) => void;
  
  // Balance state
  hasInsufficientBalance: boolean;
  setHasInsufficientBalance: (value: boolean) => void;
  balanceWarning: { title: string; message: string; type: 'token' | 'sol' } | null;
  setBalanceWarning: (warning: { title: string; message: string; type: 'token' | 'sol' } | null) => void;
  
  // Customer info
  customerInfoSubmitted: boolean;
  setCustomerInfoSubmitted: (value: boolean) => void;
  
  // Payment status
  paymentStatus: PaymentStatus | null;
  setPaymentStatus: (status: PaymentStatus | null) => void;
  
  // Transaction state
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  processingMessage: string;
  setProcessingMessage: (message: string) => void;
  
  // Modals
  errorModal: {
    isOpen: boolean;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    body: React.ReactNode;
    actionText: string;
    onAction?: () => void;
  } | null;
  setErrorModal: (modal: CheckoutState['errorModal']) => void;
  closeErrorModal: () => void;
  
  successModalOpen: boolean;
  setSuccessModalOpen: (value: boolean) => void;
  
  copySuccessModalOpen: boolean;
  setCopySuccessModalOpen: (value: boolean) => void;
  
  walletSelectorOpen: boolean;
  setWalletSelectorOpen: (value: boolean) => void;
  
  // Onramp/bank state
  bankOrderId: string | null;
  setBankOrderId: (id: string | null) => void;
  bankOrder: OnrampOrderResponse | null;
  setBankOrder: (order: OnrampOrderResponse | null) => void;
  bankTransferStartTime: number | null;
  setBankTransferStartTime: (time: number | null) => void;
  
  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  // Checkout data
  checkoutData: null,
  setCheckoutData: (data) => set({ checkoutData: data, amount: data?.amount_usd || 0 }),
  
  // Amount
  amount: 0,
  setAmount: (amount) => set({ amount }),
  
  // Active tab
  activeTab: 'wallet',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Wallet
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  
  // Balance
  hasInsufficientBalance: false,
  setHasInsufficientBalance: (value) => set({ hasInsufficientBalance: value }),
  balanceWarning: null,
  setBalanceWarning: (warning) => set({ balanceWarning: warning }),
  
  // Customer info
  customerInfoSubmitted: false,
  setCustomerInfoSubmitted: (value) => set({ customerInfoSubmitted: value }),
  
  // Payment status
  paymentStatus: null,
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  
  // Transaction
  isProcessing: false,
  setIsProcessing: (value) => set({ isProcessing: value }),
  processingMessage: '',
  setProcessingMessage: (message) => set({ processingMessage: message }),
  
  // Modals
  errorModal: null,
  setErrorModal: (modal) => set({ errorModal: modal }),
  closeErrorModal: () => set({ errorModal: null }),
  
  successModalOpen: false,
  setSuccessModalOpen: (value) => set({ successModalOpen: value }),
  
  copySuccessModalOpen: false,
  setCopySuccessModalOpen: (value) => set({ copySuccessModalOpen: value }),
  
  walletSelectorOpen: false,
  setWalletSelectorOpen: (value) => set({ walletSelectorOpen: value }),
  
  // Bank/onramp
  bankOrderId: null,
  setBankOrderId: (id) => set({ bankOrderId: id }),
  bankOrder: null,
  setBankOrder: (order) => set({ bankOrder: order }),
  bankTransferStartTime: null,
  setBankTransferStartTime: (time) => set({ bankTransferStartTime: time }),
  
  // Error
  error: null,
  setError: (error) => set({ error }),
}));
