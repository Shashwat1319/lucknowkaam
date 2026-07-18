export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" role="status" aria-label="लोड हो रहा है" />
        <p className="text-text-secondary">लोड हो रहा है...</p>
      </div>
    </div>
  );
}
