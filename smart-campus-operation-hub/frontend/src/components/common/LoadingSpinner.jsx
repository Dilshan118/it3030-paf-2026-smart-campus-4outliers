export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" style={{border: '2px solid #e5e7eb', borderTopColor: '#3b82f6'}}></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
