'use client';

import { useCheckoutStore } from '@/lib/store';

export function CopySuccessModal() {
  const { copySuccessModalOpen, setCopySuccessModalOpen } = useCheckoutStore();

  if (!copySuccessModalOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCopySuccessModalOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-[360px]">
        <div className="px-6 py-5 text-center">
          <div className="flex justify-center mb-3">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="#8866ff"
              viewBox="0 0 24 24"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
              <path strokeWidth="2" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Address Copied!</h2>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600">Wallet address copied to clipboard</p>
        </div>
      </div>
    </div>
  );
}
