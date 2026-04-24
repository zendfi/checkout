'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
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
  const [notFoundMode, setNotFoundMode] = useState<'none' | 'merchant' | 'request'>('none');
  const [merchantContactEmail, setMerchantContactEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantUserName || !requestLinkId) return;

    const loadRequestCheckout = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFoundMode('none');
        setMerchantContactEmail(null);
        setCheckoutData(null);

        // Fetch metadata first to validate public request link existence.
        await api.getPublicRequestLink(merchantUserName, requestLinkId);
        await api.preparePublicRequestLinkTransfer(merchantUserName, requestLinkId);
        const data = await api.createPublicRequestPayment(merchantUserName, requestLinkId);
        setCheckoutData(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          try {
            const merchantData = await api.getPublicMerchantLink(merchantUserName);
            setMerchantContactEmail(merchantData.merchant.email ?? null);
            setNotFoundMode('request');
          } catch (merchantErr) {
            if (merchantErr instanceof ApiError && merchantErr.status === 404) {
              setNotFoundMode('merchant');
            } else {
              const message = merchantErr instanceof Error ? merchantErr.message : 'Failed to load request-link checkout';
              setError(message);
            }
          }
        } else {
          const message = err instanceof Error ? err.message : 'Failed to load request-link checkout';
          setError(message);
        }
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

  if (notFoundMode === 'merchant') {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">zdfi.me/{merchantUserName}/{requestLinkId}</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">This link does not exist yet.</h1>
          <p className="mt-2 text-sm text-slate-500">Want one like this for yourself? Create your own global pay link in minutes.</p>
          <a
            href="https://dashboard.zendfi.tech/setup"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            Get your own link
          </a>
        </div>
      </div>
    );
  }

  if (notFoundMode === 'request') {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">zdfi.me/{merchantUserName}/{requestLinkId}</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">Could not find this payment request.</h1>
          <p className="mt-2 text-sm text-slate-500">If you believe it should exist, reach out to the merchant to confirm the request link.</p>
          {merchantContactEmail ? (
            <a
              href={`mailto:${merchantContactEmail}?subject=Missing%20payment%20request%20${encodeURIComponent(requestLinkId)}`}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Contact merchant
            </a>
          ) : (
            <a
              href={`/${merchantUserName}`}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Open merchant link
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return <ErrorState message="Failed to load checkout data" />;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
          <GeoPaymentNotice
            checkoutData={checkoutData}
            onLocalPaymentOptionUpdate={(nextOption) => {
              if (!checkoutData) return;
              setCheckoutData({
                ...checkoutData,
                local_payment_option: nextOption,
              });
            }}
          />
      </div>
      <CryptoCheckout />
      <ErrorModal />
      <SuccessModal />
      <CopySuccessModal />
      <WalletSelectorModal />
    </>
  );
}
