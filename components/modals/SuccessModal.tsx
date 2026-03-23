'use client';

import { useCheckoutStore } from '@/lib/store';
import { CheckCircle, ExternalLink } from 'lucide-react';

export function SuccessModal() {
  const { successModalOpen, setSuccessModalOpen, paymentStatus, checkoutData } = useCheckoutStore();

  if (!successModalOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSuccessModalOpen(false);
    }
  };

  const explorerUrl = paymentStatus?.transaction_signature
    ? `https://solscan.io/tx/${paymentStatus.transaction_signature}${checkoutData?.solana_network === 'devnet' ? '?cluster=devnet' : ''}`
    : null;

  const disputeUrl = checkoutData?.payment_id
    ? `https://zendfi.tech/disputes?payment_id=${checkoutData.payment_id}`
    : 'https://zendfi.tech/disputes';

  const disputeStatusUrl = 'https://zendfi.tech/disputes/status';

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-[440px]">
        {/* Success Animation */}
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-check-mark">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mt-2">Thank you for your purchase</p>
        </div>

        {/* Details */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-gray-700 text-center">
              Your payment has been confirmed!
            </p>
            <p className="text-gray-500 text-sm text-center">
              You&apos;ll receive a confirmation email shortly.
            </p>
          </div>

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary-DEFAULT hover:text-primary-700 mt-4 transition-colors"
            >
              View on Solscan
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Action */}
        <div className="px-6 pb-6 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Need help with this payment?
            <a
              href={disputeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-primary-DEFAULT hover:text-primary-700"
            >
              Open a dispute
            </a>
            <span className="mx-1">•</span>
            <a
              href={disputeStatusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-DEFAULT hover:text-primary-700"
            >
              Check dispute status
            </a>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => setSuccessModalOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
