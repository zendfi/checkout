'use client';

import { useMemo } from 'react';
import { HostedCheckoutData } from '@/lib/types';

interface GeoPaymentNoticeProps {
  checkoutData: HostedCheckoutData | null;
}

function prettyInstructionValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

export function GeoPaymentNotice({ checkoutData }: GeoPaymentNoticeProps) {
  const localPaymentOption = checkoutData?.local_payment_option;

  const instructionLines = useMemo<Array<[string, unknown]>>(() => {
    if (!localPaymentOption?.payment_details) return [];
    const details = localPaymentOption.payment_details as Record<string, unknown>;
    return [
      ['Status', details.instruction_status],
      ['Provider instruction ID', details.provider_instruction_id],
      ['Next step', details.next_step],
      ['Account number', details.account_number ?? details.bank_account_number],
      ['Reference', details.reference ?? details.client_reference_id],
    ].filter(([, value]) => value !== undefined && value !== null && value !== '') as Array<[string, unknown]>;
  }, [localPaymentOption?.payment_details]);

  if (!localPaymentOption) return null;

  const details = localPaymentOption.payment_details as Record<string, unknown> | undefined;
  const sourceDepositInstructions = details?.source_deposit_instructions;
  const provider = localPaymentOption.provider.toLowerCase();
  const isBridge = provider === 'bridge';
  const isPaj = provider === 'paj';
  const title = isBridge
    ? 'Bridge payment instructions'
    : isPaj
      ? 'Paj payment instructions'
      : 'Localized payment instructions';
  const subtitle = isBridge
    ? 'Follow these transfer instructions exactly to complete your checkout.'
    : isPaj
      ? 'Use these local bank transfer details to complete payment in NGN.'
      : 'Use these localized payment details to complete your checkout.';

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

        {isBridge && Boolean(sourceDepositInstructions) && (
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Source deposit instructions</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-300">{prettyInstructionValue(sourceDepositInstructions)}</pre>
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
