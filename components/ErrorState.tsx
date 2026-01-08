import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFBFC]">
      <div className="card max-w-[480px] w-full p-8 text-center animate-fade-in">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Error</h1>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact the merchant for assistance.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-secondary mt-6"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
