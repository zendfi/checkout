'use client';

interface CheckoutHeaderNewProps {
  merchantName: string;
  network?: string;
}

export function CheckoutHeaderNew({ merchantName, network }: CheckoutHeaderNewProps) {
  const isTestnet = network === 'devnet' || network === 'testnet';

  return (
    <div className="text-center py-3 sm:py-4 px-4 border-b border-gray-100 bg-white">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
          {merchantName}
        </h1>
        {isTestnet && (
          <span className="testnet-badge flex-shrink-0">
            Testnet
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
        Secure Crypto Payment on Solana
      </p>
    </div>
  );
}
