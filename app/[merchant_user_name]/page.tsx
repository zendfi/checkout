'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { PublicMerchantLinkData } from '@/lib/types';
import { useCheckoutStore } from '@/lib/store';
import { CryptoCheckout } from '@/components/wizard/CryptoCheckout';
import { GeoPaymentNotice } from '@/components/GeoPaymentNotice';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { SuccessModal } from '@/components/modals/SuccessModal';
import { WalletSelectorModal } from '@/components/modals/WalletSelectorModal';
import { CopySuccessModal } from '@/components/modals/CopySuccessModal';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';

export default function PublicMerchantPage() {
  const params = useParams();
  const merchantUserName = params.merchant_user_name as string;

  const { checkoutData, setCheckoutData } = useCheckoutStore();

  const [merchantData, setMerchantData] = useState<PublicMerchantLinkData | null>(null);
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchantNotFound, setMerchantNotFound] = useState(false);
  const localProvider = checkoutData?.local_payment_option?.provider?.toLowerCase();
  const isLocalNonCryptoCheckout = localProvider === 'bridge' || localProvider === 'paj';

  useEffect(() => {
    if (!merchantUserName) return;

    const loadPublicMerchantData = async () => {
      try {
        setLoading(true);
        setError(null);
        setMerchantNotFound(false);
        setCheckoutData(null);

        const data = await api.getPublicMerchantLink(merchantUserName);
        setMerchantData(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setMerchantNotFound(true);
          setError(null);
        } else {
          const message = err instanceof Error ? err.message : 'Failed to load merchant link';
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    void loadPublicMerchantData();
  }, [merchantUserName, setCheckoutData]);

  const handleStartCheckout = async () => {
    if (!merchantUserName || amountUsd <= 0) return;

    try {
      setCreatingPayment(true);
      setError(null);
      const data = await api.createPublicMerchantPayment(merchantUserName, amountUsd);
      setCheckoutData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkout payment';
      setError(message);
    } finally {
      setCreatingPayment(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error && !checkoutData) {
    return <ErrorState message={error} />;
  }

  if (merchantNotFound) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">zdfi.me/{merchantUserName}</p>
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

  if (checkoutData) {
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
        {!isLocalNonCryptoCheckout && (
          <>
            <CryptoCheckout />
            <ErrorModal />
            <SuccessModal />
            <CopySuccessModal />
            <WalletSelectorModal />
          </>
        )}
      </>
    );
  }

  if (!merchantData) {
    return <ErrorState message="Merchant link not found" />;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ZendFi</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{merchantData.merchant.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Pay what you want and continue to checkout.</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-slate-500">Country</div>
            <div className="mt-1 font-semibold text-slate-900">{merchantData.routing.country_code}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-slate-500">Provider</div>
            <div className="mt-1 font-semibold text-slate-900 uppercase">{merchantData.routing.provider}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-slate-500">Rail</div>
            <div className="mt-1 font-semibold text-slate-900">{merchantData.routing.rail}</div>
          </div>
        </div>

        <label className="block text-sm font-semibold text-slate-800 mb-2">Amount (USD)</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amountUsd}
          onChange={(e) => setAmountUsd(Number(e.target.value))}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-primary"
        />

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleStartCheckout}
          disabled={creatingPayment || amountUsd <= 0}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {creatingPayment ? 'Preparing checkout...' : 'Continue to Checkout'}
        </button>
      </div>
    </div>
  );
}
