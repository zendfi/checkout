import {
  HostedCheckoutData,
  PublicMerchantLinkData,
  PublicRequestLinkData,
  BuildTransactionRequest,
  BuildTransactionResponse,
  CheckBalanceRequest,
  CheckBalanceResponse,
  PaymentStatus,
  CustomerInfo,
  OnrampInitiateRequest,
  OnrampInitiateResponse,
  OnrampCreateOrderRequest,
  OnrampOrderResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zendfi.tech';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  timeout = 8000,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Requesting from ${url} (attempt ${attempt}/${maxAttempts})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || errorMessage;
        } catch {
          // Could not parse error response
        }
        throw new ApiError(response.status, errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }

      const isTimeout = error instanceof Error && error.name === 'AbortError';
      console.warn(
        `Request failed (attempt ${attempt}): ${isTimeout ? 'Timeout' : (error as Error).message}. Retrying...`
      );

      const delay = 300 * attempt + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retry attempts reached');
}

export const api = {
  // Public merchant PWYW page data
  async getPublicMerchantLink(merchantUserName: string): Promise<PublicMerchantLinkData> {
    const response = await fetch(`${API_BASE}/api/v1/public/links/${merchantUserName}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Merchant link not found');
      }
      throw new ApiError(response.status, 'Failed to fetch merchant link data');
    }
    return response.json();
  },

  // Public merchant PWYW payment creation
  async createPublicMerchantPayment(
    merchantUserName: string,
    amountUsd: number
  ): Promise<HostedCheckoutData> {
    const response = await fetch(`${API_BASE}/api/v1/public/links/${merchantUserName}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_usd: amountUsd }),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Merchant link not found');
      }
      throw new ApiError(response.status, 'Failed to create merchant payment');
    }
    return response.json();
  },

  // Public request-link data
  async getPublicRequestLink(
    merchantUserName: string,
    requestLinkId: string
  ): Promise<PublicRequestLinkData> {
    const response = await fetch(`${API_BASE}/api/v1/public/links/${merchantUserName}/${requestLinkId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Request link not found');
      }
      throw new ApiError(response.status, 'Failed to fetch request link data');
    }
    return response.json();
  },

  // Public request-link payment creation (fixed amount)
  async createPublicRequestPayment(
    merchantUserName: string,
    requestLinkId: string
  ): Promise<HostedCheckoutData> {
    const response = await fetch(`${API_BASE}/api/v1/public/links/${merchantUserName}/${requestLinkId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Request link not found');
      }
      if (response.status === 410) {
        throw new ApiError(410, 'Request link expired or maxed out');
      }
      throw new ApiError(response.status, 'Failed to create request payment');
    }
    return response.json();
  },

  // Get payment link info
  async getPaymentLink(linkCode: string): Promise<HostedCheckoutData> {
    const response = await fetch(`${API_BASE}/api/v1/checkout/${linkCode}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Payment link not found');
      }
      if (response.status === 410) {
        throw new ApiError(410, 'Payment link expired');
      }
      throw new ApiError(response.status, 'Failed to fetch payment link');
    }
    return response.json();
  },

  // Create payment from link
  async createPaymentFromLink(linkCode: string): Promise<HostedCheckoutData> {
    const response = await fetch(`${API_BASE}/api/v1/payment-links/${linkCode}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Payment link not found');
      }
      if (response.status === 410) {
        throw new ApiError(410, 'Payment link expired or maxed out');
      }
      throw new ApiError(response.status, 'Failed to create payment');
    }
    return response.json();
  },

  // Get payment data by ID
  async getPaymentData(paymentId: string): Promise<HostedCheckoutData> {
    const response = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/checkout-data`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, 'Payment not found');
      }
      throw new ApiError(response.status, 'Failed to fetch payment data');
    }
    return response.json();
  },

  // Build transaction
  async buildTransaction(
    paymentId: string,
    request: BuildTransactionRequest
  ): Promise<BuildTransactionResponse> {
    return fetchWithRetry(
      `${API_BASE}/api/v1/payments/${paymentId}/build-transaction`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
      8000,
      3
    );
  },

  // Submit transaction
  async submitTransaction(paymentId: string, transactionSignature: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/submit-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_signature: transactionSignature }),
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to submit transaction');
    }
  },

  // Submit gasless transaction
  async submitGaslessTransaction(paymentId: string, signedTransaction: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/api/v1/payments/${paymentId}/submit-gasless-transaction`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signed_transaction: signedTransaction }),
      }
    );
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to submit gasless transaction');
    }
  },

  // Check wallet balance
  async checkBalance(request: CheckBalanceRequest): Promise<CheckBalanceResponse> {
    const response = await fetch(`${API_BASE}/api/v1/wallet/check-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to check balance');
    }
    return response.json();
  },

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/status`);
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to get payment status');
    }
    return response.json();
  },

  // Submit customer info
  async submitCustomerInfo(paymentId: string, customerInfo: CustomerInfo): Promise<void> {
    const response = await fetch(`${API_BASE}/api/v1/payments/${paymentId}/customer-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerInfo),
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to save customer information');
    }
  },

  // Onramp: Initiate (send OTP)
  async onrampInitiate(request: OnrampInitiateRequest): Promise<OnrampInitiateResponse> {
    const response = await fetch(`${API_BASE}/api/v1/onramp/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(response.status, data.error || 'Failed to initiate session');
    }
    return response.json();
  },

  // Onramp: Create order
  async onrampCreateOrder(request: OnrampCreateOrderRequest): Promise<OnrampOrderResponse> {
    const response = await fetch(`${API_BASE}/api/v1/onramp/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    // 202 means still processing OTP - throw error to continue polling
    if (response.status === 202) {
      const data = await response.json();
      throw new ApiError(202, data.message || 'Still processing verification');
    }
    
    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(response.status, data.error || 'Invalid verification code');
    }
    return response.json();
  },

  // Onramp: Get order status
  async onrampGetOrder(orderId: string): Promise<OnrampOrderResponse> {
    const response = await fetch(`${API_BASE}/api/v1/onramp/orders/${orderId}`);
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to get order status');
    }
    return response.json();
  },
};

export { ApiError };
