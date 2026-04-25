'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { HostedCheckoutData, SupportedRailOption } from '@/lib/types';

interface GeoPaymentNoticeProps {
  checkoutData: HostedCheckoutData | null;
  onLocalPaymentOptionUpdate?: (nextOption: HostedCheckoutData['local_payment_option']) => void;
}

function prettyInstructionValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

export function GeoPaymentNotice({ checkoutData, onLocalPaymentOptionUpdate }: GeoPaymentNoticeProps) {
  const localPaymentOption = checkoutData?.local_payment_option;
  const [selectedRailCountryCode, setSelectedRailCountryCode] = useState<string>('');
  const [preparingOverride, setPreparingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [selectionHydrated, setSelectionHydrated] = useState(false);
  const autoAppliedRef = useRef(false);

  const details = localPaymentOption?.payment_details as Record<string, unknown> | undefined;
  const bridgeVirtualAccount = details?.bridge_virtual_account as Record<string, unknown> | undefined;
  const bridgeRaw = bridgeVirtualAccount?.raw as Record<string, unknown> | undefined;
  const bridgeDestination =
    (bridgeVirtualAccount?.destination as Record<string, unknown> | undefined) ??
    (bridgeRaw?.destination as Record<string, unknown> | undefined);
  const bridgeSourceDepositInstructions =
    bridgeVirtualAccount?.source_deposit_instructions ??
    bridgeRaw?.source_deposit_instructions ??
    details?.source_deposit_instructions;
  const bridgeDestinationRail = (bridgeDestination?.payment_rail ?? localPaymentOption?.rail) as string | undefined;
  const bridgeDestinationCurrency = (bridgeDestination?.currency ?? localPaymentOption?.local_currency) as string | undefined;
  const bridgeDestinationAddress =
    (bridgeDestination?.address ?? details?.destination_address ?? details?.account_number ?? bridgeVirtualAccount?.destination_address) as string | undefined;

  const instructionLines = useMemo<Array<[string, unknown]>>(() => {
    const memoDetails = localPaymentOption?.payment_details as Record<string, unknown> | undefined;
    if (!memoDetails) return [];
    return [
      ['Status', memoDetails.instruction_status],
      ['Provider instruction ID', memoDetails.provider_instruction_id],
      ['Next step', memoDetails.next_step],
      ['Account number', memoDetails.account_number ?? memoDetails.bank_account_number],
      ['Reference', memoDetails.reference ?? memoDetails.client_reference_id],
    ].filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, unknown]>;
  }, [localPaymentOption?.payment_details]);

  if (!localPaymentOption) return null;
  const comingSoon = Boolean(details?.coming_soon);
  const supportedRails = (details?.supported_rails ?? []) as SupportedRailOption[];
  const provider = localPaymentOption.provider.toLowerCase();
  const isBridge = provider === 'bridge';
  const isPaj = provider === 'paj';
  const title = isBridge
    ? 'ACH virtual account'
    : isPaj
      ? 'Paj payment instructions'
      : 'Localized payment instructions';
  const subtitle = isBridge
    ? 'Send the transfer to the account below to complete your checkout.'
    : isPaj
      ? 'Use these local bank transfer details to complete payment in NGN.'
      : 'Use these localized payment details to complete your checkout.';

  const paymentId = checkoutData?.payment_id;
  const storageKey = paymentId ? `zdfi:rail-country:${paymentId}` : null;

  const effectiveSelectedRailCountryCode = selectedRailCountryCode || supportedRails[0]?.country_code || '';
  const selectedRail = supportedRails.find((option) => option.country_code === effectiveSelectedRailCountryCode);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      setSelectionHydrated(true);
      return;
    }

    const persisted = window.localStorage.getItem(storageKey);
    if (persisted) {
      setSelectedRailCountryCode(persisted);
    }
    setSelectionHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!selectionHydrated || !comingSoon || !paymentId || !onLocalPaymentOptionUpdate || !selectedRail || preparingOverride) return;
    if (autoAppliedRef.current) return;

    autoAppliedRef.current = true;
    void handleProceedWithSupportedRail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionHydrated, comingSoon, paymentId, onLocalPaymentOptionUpdate, selectedRail, preparingOverride]);

  const handleProceedWithSupportedRail = async () => {
    if (!paymentId || !effectiveSelectedRailCountryCode || !onLocalPaymentOptionUpdate || !selectedRail) return;

    try {
      setPreparingOverride(true);
      setOverrideError(null);
      const prepared = await api.preparePaymentLocalOption(
        paymentId,
        {
          selected_country_code: selectedRail.country_code,
          selected_provider: selectedRail.provider,
          selected_rail: selectedRail.rail,
          force_refresh: true,
        }
      );
      onLocalPaymentOptionUpdate(prepared.local_payment_option);
      if (storageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, effectiveSelectedRailCountryCode);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to prepare selected payment rail.';
      setOverrideError(message);
    } finally {
      setPreparingOverride(false);
    }
  };

  return (
    <div className="mb-4 sm:mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60 overflow-hidden">
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {localPaymentOption.provider}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {localPaymentOption.rail}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{localPaymentOption.country_code}</span>
        </div>
        <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {localPaymentOption.local_amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {localPaymentOption.local_currency} at {localPaymentOption.fx_rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {comingSoon && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-700/60 dark:bg-amber-900/20">
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">ZendFi is coming soon to your country</div>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              Proceed to pay using one of our currently supported local rails.
            </p>

            {supportedRails.length > 0 && (
              <div className="mt-3 space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-100">
                  Available rails
                </label>
                <select
                  value={effectiveSelectedRailCountryCode}
                  onChange={(event) => setSelectedRailCountryCode(event.target.value)}
                  className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary dark:border-amber-700 dark:bg-slate-900 dark:text-white"
                >
                  {supportedRails.map((option) => (
                    <option key={`${option.country_code}-${option.rail}`} value={option.country_code}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {paymentId && onLocalPaymentOptionUpdate && (
                  <button
                    type="button"
                    onClick={handleProceedWithSupportedRail}
                    disabled={preparingOverride || !effectiveSelectedRailCountryCode}
                    className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {preparingOverride ? 'Preparing payment details...' : 'Proceed to pay with selected rail'}
                  </button>
                )}

                {overrideError && (
                  <p className="text-xs text-rose-600 dark:text-rose-300">{overrideError}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Provider</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{localPaymentOption.provider}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Rail</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{localPaymentOption.rail}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Amount</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{localPaymentOption.local_amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {localPaymentOption.local_currency}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Quote</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{localPaymentOption.quote_source}</div>
          </div>
        </div>

        {isBridge && bridgeVirtualAccount && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/60 dark:bg-emerald-900/15">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">ACH virtual account</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Destination rail</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{prettyInstructionValue(bridgeDestinationRail)}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Destination currency</div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-white">{prettyInstructionValue(bridgeDestinationCurrency)}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/50 sm:col-span-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Account / address</div>
                <div className="mt-1 break-all font-semibold text-slate-900 dark:text-white">{prettyInstructionValue(bridgeDestinationAddress)}</div>
              </div>
            </div>

            {Boolean(bridgeSourceDepositInstructions) && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-white/80 p-3 dark:border-emerald-800/60 dark:bg-slate-950/40">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-200">Source deposit instructions</div>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">{prettyInstructionValue(bridgeSourceDepositInstructions)}</pre>
              </div>
            )}
          </div>
        )}

        {instructionLines.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Instruction summary</div>
            <div className="space-y-2 text-sm">
              {instructionLines.map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-3 border-b border-dashed border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="max-w-[70%] text-right font-medium text-slate-900 dark:text-white break-all">{prettyInstructionValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isBridge
            ? 'Use this Bridge route for the selected country. NG traffic should remain on Paj.'
            : isPaj
              ? 'This route is using Paj for NG checkout as defined by routing policy.'
              : 'This local payment option is derived from the merchant routing policy and request geo.'}
        </p>
      </div>
    </div>
  );
}
