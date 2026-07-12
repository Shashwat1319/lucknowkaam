import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "हमारे बारे में",
  description: "LucknowKaam के बारे में जानें। लखनऊ की #1 लोकल जॉब साइट।",
};

export default function AboutPage() {
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
              { "@type": "ListItem", position: 2, name: "हमारे बारे में", item: "https://lucknowkaam.vercel.app/about" },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">हमारे बारे में</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
        LucknowKaam के बारे में
      </h1>

      <div className="space-y-6 text-text-secondary leading-relaxed">
        <p className="text-lg">
          <strong>LucknowKaam</strong> लखनऊ की #1 लोकल जॉब साइट है। हमारा मकसद
          लखनऊ और आसपास के इलाकों में नौकरी खोजने वालों को उनकी पसंद की नौकरी
          दिलाना है।
        </p>

        <p>
          हम जानते हैं कि लखनऊ में हजारों लोग रोजाना नौकरी खोजते हैं। डिलीवरी बॉय
          से लेकर दुकान का काम, ड्राइवर, डेटा एंट्री, टीचिंग और घर से काम —
          हर तरह की नौकरी आपको यहां मिलेगी।
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमारी विशेषताएं</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[
            { title: "100% मुफ्त", desc: "नौकरी खोजना और अप्लाई करना बिल्कुल मुफ्त है" },
            { title: "लोकल जॉब", desc: "सिर्फ लखनऊ और आसपास के इलाकों की नौकरियां" },
            { title: "हिंदी में", desc: "पूरी जानकारी हिंदी भाषा में, समझने में आसान" },
            { title: "हर दिन नई जॉब", desc: "रोजाना नई नौकरियां अपडेट की जाती हैं" },
            { title: "आसान अप्लाई", desc: "एक क्लिक में कॉल या WhatsApp करें" },
            { title: "सुरक्षित", desc: "हर जॉब की जांच की जाती है" },
          ].map((f, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-primary text-xl">✓</span>
              <div>
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमसे संपर्क करें</h2>
        <p>
          अगर आपको कोई सवाल या सुझाव है, तो कृपया हमसे{" "}
          <Link href="/contact" className="text-primary hover:underline">
            संपर्क
          </Link>{" "}
          करें।
        </p>
      </div>
    </div>
  );
}
