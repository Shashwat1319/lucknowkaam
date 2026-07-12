import Link from "next/link";
import { CATEGORIES, LUCKNOW_AREAS } from "@/types";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">लखनऊ काम</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              लखनऊ की #1 लोकल जॉब साइट। हम लखनऊ और आसपास के इलाकों में नौकरी खोजने वालों और नौकरी देने वालों को जोड़ते हैं।
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">त्वरित लिंक</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-300 hover:text-primary text-sm transition-colors">होम</Link>
              <Link href="/jobs" className="text-gray-300 hover:text-primary text-sm transition-colors">सभी नौकरियां</Link>
              <Link href="/post-job" className="text-gray-300 hover:text-primary text-sm transition-colors">नौकरी पोस्ट करें</Link>
              <Link href="/about" className="text-gray-300 hover:text-primary text-sm transition-colors">हमारे बारे में</Link>
              <Link href="/contact" className="text-gray-300 hover:text-primary text-sm transition-colors">संपर्क</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">नौकरी की श्रेणियां</h4>
            <div className="flex flex-col gap-2">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  {cat.icon} {cat.name_hindi}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">लखनऊ के एरिया</h4>
            <div className="flex flex-col gap-2">
              {LUCKNOW_AREAS.slice(0, 8).map((area) => (
                <Link
                  key={area}
                  href={`/location/${area.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-300 hover:text-primary text-sm transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 LucknowKaam - लखनऊ की #1 जॉब साइट | लखनऊ में नौकरी खोजें
          </p>
        </div>
      </div>
    </footer>
  );
}
