'use client';

interface CheckoutHeaderNewProps {
  merchantName: string;
  network?: string;
}

export function CheckoutHeaderNew({ merchantName, network }: CheckoutHeaderNewProps) {
  const isTestnet = network === 'devnet' || network === 'testnet';

  return (
    <div className="text-center py-4 px-4 border-b border-gray-100">
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-base font-bold text-gray-900">{merchantName}</h1>
        {isTestnet && (
          <span className="testnet-badge">
            Testnet
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-0.5">
        Secure Crypto Payment on Solana
      </p>
    </div>
  );
}
