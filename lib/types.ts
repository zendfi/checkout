export interface HostedCheckoutData {
  payment_id: string;
  merchant_name: string;
  amount_usd: number;
  currency: string;
  token: string;
  description: string | null;
  qr_code: string;
  payment_url: string;
  wallet_address: string;
  expires_at: string;
  status: string;
  solana_network: string;
  allow_custom_amount: boolean;
  minimum_amount: number | null;
  maximum_amount: number | null;
  suggested_amount: number | null;
  onramp: boolean;
  payment_link_id: string | null;
  /** Original NGN amount for exact PAJ conversion (if set via NGN calculator) */
  amount_ngn?: number;
  /** Service charge in NGN added on top of amount_ngn (shown to payer, inflated into PAJ) */
  service_charge_ngn?: number;
  /** Whether service charge applies to this link */
  payer_service_charge?: boolean;
}

export interface PaymentLinkResponse {
  id: string;
  link_code: string;
  payment_url: string;
  hosted_page_url: string;
  amount: number;
  currency: string;
  token: string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  onramp: boolean;
}

export interface BuildTransactionRequest {
  payer_wallet: string;
  amount_override: number | null;
  prefer_gasless: boolean;
}

export interface BuildTransactionResponse {
  transaction: string;
  message: string;
  is_gasless: boolean;
  requires_backend_submission: boolean;
}

export interface CheckBalanceRequest {
  wallet_address: string;
  token: string;
  network: string;
}

export interface CheckBalanceResponse {
  sol_balance: number;
  token_balance: number | null;
  network: string;
}

export interface PaymentStatus {
  status: 'pending' | 'verifying' | 'confirmed' | 'failed' | 'expired';
  transaction_signature?: string;
}

export interface CustomerInfo {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  billing_address?: {
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
  };
}

export interface OnrampInitiateRequest {
  customer_email: string;
  fiat_amount: number;
  payment_link_id: string | null;
  /** Original NGN amount for exact PAJ conversion */
  amount_ngn?: number;
}

export interface OnrampInitiateResponse {
  customer_wallet: {
    id: string;
    customer_email: string;
    wallet_address: string;
  };
  session_initiated: boolean;
  message: string;
  session_id: string;
  proxy_email: string;
}

export interface OnrampCreateOrderRequest {
  customer_email: string;
  customer_name?: string;
  otp?: string; // Optional - for legacy flow
  session_id?: string; // Optional - for centralized flow
  fiat_amount: number;
  currency: string;
  payment_link_id: string | null;
  payment_intent_id: string | null;
  webhook_url: string | null;
  /** Original NGN amount for exact PAJ conversion */
  amount_ngn?: number;  /** Whether service charge should be applied/was applied */
  payer_service_charge?: boolean;}

export interface OnrampOrderResponse {
  order_id: string;
  paj_order_id: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  fiat_amount: number;
  token_amount: number;
  exchange_rate: number;
  customer_wallet: string;
  status: string;
  payment_id?: string;
}

export type NetworkConfig = {
  rpc: string;
  usdc: string;
  usdt: string;
};

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  'mainnet-beta': {
    rpc: 'https://api.mainnet-beta.solana.com',
    usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    usdt: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
  mainnet: {
    rpc: 'https://api.mainnet-beta.solana.com',
    usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    usdt: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
  devnet: {
    rpc: 'https://api.devnet.solana.com',
    usdc: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    usdt: 'EgEHQxJ8aPe7bsrR88zG3w3Y9N5CZg3w8d1K1CZg3w8d',
  },
};

export function getNetworkConfig(network: string): NetworkConfig {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS.devnet;
}
