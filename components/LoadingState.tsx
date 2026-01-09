export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFC]">
      <div className="card max-w-[420px] w-full p-12 text-center animate-fade-in">
        <div className="relative">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-primary-DEFAULT rounded-full animate-spin mx-auto mb-6" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Loading Checkout</h2>
        <p className="text-gray-500 text-xs">Please wait while we prepare your payment...</p>
      </div>
    </div>
  );
}
