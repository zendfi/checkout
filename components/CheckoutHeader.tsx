interface CheckoutHeaderProps {
  merchantName: string;
  network: string;
}

export function CheckoutHeader({ merchantName, network }: CheckoutHeaderProps) {
  return (
    <div className="px-7 py-6 border-b border-gray-200 relative">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
        {merchantName}
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Secure Crypto Payment on Solana
        {network === 'devnet' && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Testnet
          </span>
        )}
      </p>
    </div>
  );
}
