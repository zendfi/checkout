'use client';

interface CheckoutHeaderNewProps {
  merchantName: string;
  network?: string;
}

export function CheckoutHeaderNew({ merchantName, network }: CheckoutHeaderNewProps) {
  const isTestnet = network === 'devnet' || network === 'testnet';

  return (
    <div className="text-center py-6 px-6 border-b border-gray-100">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{merchantName}</h1>
        {isTestnet && (
          <span className="testnet-badge">
            Testnet
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Secure Crypto Payment on Solana
      </p>
    </div>
  );
}
