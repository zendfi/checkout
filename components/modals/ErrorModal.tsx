'use client';

import { useCheckoutStore } from '@/lib/store';

export function ErrorModal() {
  const { errorModal, closeErrorModal } = useCheckoutStore();

  if (!errorModal?.isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeErrorModal();
    }
  };

  const handleAction = () => {
    if (errorModal.onAction) {
      errorModal.onAction();
    }
    closeErrorModal();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="px-6 py-5 text-center">
          <div className="flex justify-center mb-3 text-red-600">
            {errorModal.icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{errorModal.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{errorModal.subtitle}</p>
        </div>

        <div className="px-6 pb-5">
          {errorModal.body}
        </div>

        <div className="flex gap-3 px-6 pb-6 border-t border-gray-100 pt-4">
          {errorModal.actionText !== 'Cancel' && (
            <button
              className="btn btn-secondary flex-1"
              onClick={closeErrorModal}
            >
              Cancel
            </button>
          )}
          <button
            className={`btn ${errorModal.actionText === 'Cancel' ? 'btn-secondary' : 'btn-primary'} flex-1`}
            onClick={handleAction}
          >
            {errorModal.actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
