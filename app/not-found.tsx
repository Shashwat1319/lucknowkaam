import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          यह पेज नहीं मिला
        </h1>
        <p className="text-text-secondary mb-8">
          हो सकता है कि यह नौकरी हटा दी गई हो या URL गलत हो। कृपया दोबारा जांच करें।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            होम पेज पर जाएं
          </Link>
          <Link href="/jobs" className="btn-secondary">
            सभी नौकरियां देखें
          </Link>
        </div>
      </div>
    </div>
  );
}
