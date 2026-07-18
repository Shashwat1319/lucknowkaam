"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">कुछ गलत हो गया</h1>
        <p className="text-text-secondary mb-6">
          पेज लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।
        </p>
        <button onClick={reset} className="btn-primary">
          पुनः प्रयास करें
        </button>
      </div>
    </div>
  );
}
