export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-brand-purple"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" />
            <path strokeWidth="2" d="M16 10h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">ZendFi Checkout</h1>
        <p className="text-gray-500 mb-6">
          Secure crypto payments powered by Solana
        </p>
        <div className="info-box">
          <p>
            To make a payment, you need a valid payment link from a merchant.
          </p>
        </div>
      </div>
    </div>
  );
}
