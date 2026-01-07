import { create } from 'zustand';
import { HostedCheckoutData, PaymentStatus, OnrampOrderResponse } from './types';

interface WalletInfo {
  name: string;
  publicKey: string;
  provider: any;
}

interface CheckoutState {
  checkoutData: HostedCheckoutData | null;
  setCheckoutData: (data: HostedCheckoutData | null) => void;
  
  amount: number;
  setAmount: (amount: number) => void;
  
  activeTab: 'wallet' | 'qr' | 'bank';
  setActiveTab: (tab: 'wallet' | 'qr' | 'bank') => void;
  
  wallet: WalletInfo | null;
  setWallet: (wallet: WalletInfo | null) => void;
  
  hasInsufficientBalance: boolean;
  setHasInsufficientBalance: (value: boolean) => void;
  balanceWarning: { title: string; message: string; type: 'token' | 'sol' } | null;
  setBalanceWarning: (warning: { title: string; message: string; type: 'token' | 'sol' } | null) => void;
  
  customerInfoSubmitted: boolean;
  setCustomerInfoSubmitted: (value: boolean) => void;
  
  paymentStatus: PaymentStatus | null;
  setPaymentStatus: (status: PaymentStatus | null) => void;
  
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  processingMessage: string;
  setProcessingMessage: (message: string) => void;
  
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
  
  bankOrderId: string | null;
  setBankOrderId: (id: string | null) => void;
  bankOrder: OnrampOrderResponse | null;
  setBankOrder: (order: OnrampOrderResponse | null) => void;
  bankTransferStartTime: number | null;
  setBankTransferStartTime: (time: number | null) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  checkoutData: null,
  setCheckoutData: (data) => set({ checkoutData: data, amount: data?.amount_usd || 0 }),
  
  amount: 0,
  setAmount: (amount) => set({ amount }),
  
  activeTab: 'wallet',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  
  hasInsufficientBalance: false,
  setHasInsufficientBalance: (value) => set({ hasInsufficientBalance: value }),
  balanceWarning: null,
  setBalanceWarning: (warning) => set({ balanceWarning: warning }),
  
  customerInfoSubmitted: false,
  setCustomerInfoSubmitted: (value) => set({ customerInfoSubmitted: value }),
  
  paymentStatus: null,
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  
  isProcessing: false,
  setIsProcessing: (value) => set({ isProcessing: value }),
  processingMessage: '',
  setProcessingMessage: (message) => set({ processingMessage: message }),
  
  errorModal: null,
  setErrorModal: (modal) => set({ errorModal: modal }),
  closeErrorModal: () => set({ errorModal: null }),
  
  successModalOpen: false,
  setSuccessModalOpen: (value) => set({ successModalOpen: value }),
  
  copySuccessModalOpen: false,
  setCopySuccessModalOpen: (value) => set({ copySuccessModalOpen: value }),
  
  walletSelectorOpen: false,
  setWalletSelectorOpen: (value) => set({ walletSelectorOpen: value }),
  
  bankOrderId: null,
  setBankOrderId: (id) => set({ bankOrderId: id }),
  bankOrder: null,
  setBankOrder: (order) => set({ bankOrder: order }),
  bankTransferStartTime: null,
  setBankTransferStartTime: (time) => set({ bankTransferStartTime: time }),
  
  error: null,
  setError: (error) => set({ error }),
}));
