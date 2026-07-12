import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "संपर्क करें",
  description: "LucknowKaam से संपर्क करें। हमें अपने सवाल या सुझाव भेजें।",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "होम", item: "https://lucknowkaam.vercel.app" },
              { "@type": "ListItem", position: 2, name: "संपर्क", item: "https://lucknowkaam.vercel.app/contact" },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">संपर्क</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
        संपर्क करें
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">हमसे जुड़ें</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm text-text-secondary">ईमेल</p>
                <p className="font-semibold">contact@lucknowkaam.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-sm text-text-secondary">फोन / WhatsApp</p>
                <p className="font-semibold">+91 9999999999</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-text-secondary">पता</p>
                <p className="font-semibold">लखनऊ, उत्तर प्रदेश, भारत</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">हमें संदेश भेजें</h2>
          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="आपका नाम"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="ईमेल पता"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <textarea
                rows={4}
                placeholder="आपका संदेश"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              संदेश भेजें
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
