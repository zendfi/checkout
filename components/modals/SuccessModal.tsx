'use client';

import { useCheckoutStore } from '@/lib/store';
import { CheckIcon } from '@/components/icons';

export function SuccessModal() {
  const { successModalOpen, setSuccessModalOpen } = useCheckoutStore();

  if (!successModalOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSuccessModalOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-[420px]">
        <div className="px-6 py-5 text-center">
          <div className="flex justify-center mb-3">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="#10B981"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mt-1">Thank you for your purchase</p>
        </div>

        <div className="px-6 py-8 text-center">
          <p className="text-gray-700 mb-4">
            Your payment has been confirmed onchain!
          </p>
          <p className="text-gray-500 text-sm">
            You&apos;ll receive a confirmation email shortly.
          </p>
        </div>

        <div className="px-6 pb-6">
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
