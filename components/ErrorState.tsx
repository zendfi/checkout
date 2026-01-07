interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h1>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="info-box">
          <p>
            If you believe this is an error, please contact the merchant for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
