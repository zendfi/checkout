export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFC]">
      <div className="card max-w-[480px] w-full p-12 text-center animate-fade-in">
        <div className="relative">
          <div className="spinner-dark spinner-lg mx-auto mb-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Checkout</h2>
        <p className="text-gray-500 text-sm">Please wait while we prepare your payment...</p>
      </div>
    </div>
  );
}
