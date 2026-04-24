'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useCheckoutStore } from '@/lib/store';
import { CryptoCheckout } from '@/components/wizard/CryptoCheckout';
import { GeoPaymentNotice } from '@/components/GeoPaymentNotice';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { SuccessModal } from '@/components/modals/SuccessModal';
import { WalletSelectorModal } from '@/components/modals/WalletSelectorModal';
import { CopySuccessModal } from '@/components/modals/CopySuccessModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

export default function PublicRequestLinkPage() {
  const params = useParams();
  const merchantUserName = params.merchant_user_name as string;
  const requestLinkId = params.request_link_id as string;

  const { checkoutData, setCheckoutData } = useCheckoutStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantUserName || !requestLinkId) return;

    const loadRequestCheckout = async () => {
      try {
        setLoading(true);
        setError(null);
        setCheckoutData(null);

        // Fetch metadata first to validate public request link existence.
        await api.getPublicRequestLink(merchantUserName, requestLinkId);
        const data = await api.createPublicRequestPayment(merchantUserName, requestLinkId);
        setCheckoutData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load request-link checkout';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadRequestCheckout();
  }, [merchantUserName, requestLinkId, setCheckoutData]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!checkoutData) {
    return <ErrorState message="Failed to load checkout data" />;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
        <GeoPaymentNotice checkoutData={checkoutData} />
      </div>
      <CryptoCheckout />
      <ErrorModal />
      <SuccessModal />
      <CopySuccessModal />
      <WalletSelectorModal />
    </>
  );
}
