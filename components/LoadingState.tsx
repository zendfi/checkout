export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-12 text-center">
        <div className="spinner-dark mx-auto w-8 h-8 mb-4" />
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    </div>
  );
}
