import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "सेवा की शर्तें | Terms of Service",
  description: "LucknowKaam की सेवा की शर्तें — नौकरी खोजने और पोस्ट करने के नियम और शर्तें।",
};

export default function TermsPage() {
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
              { "@type": "ListItem", position: 2, name: "सेवा की शर्तें", item: "https://lucknowkaam.vercel.app/terms" },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">सेवा की शर्तें</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-6">सेवा की शर्तें</h1>
      <p className="text-sm text-text-secondary mb-8">अंतिम अपडेट: 20 जुलाई 2026</p>

      <div className="space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">1. स्वीकृति</h2>
          <p>
            LucknowKaam.vercel.app (&quot;साइट&quot;) का उपयोग करके, आप इन सेवा की शर्तों से सहमत होते हैं।
            अगर आप इन शर्तों से सहमत नहीं हैं, तो कृपया साइट का उपयोग न करें।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">2. सेवा का विवरण</h2>
          <p>
            LucknowKaam एक मुफ्त नौकरी पोर्टल है जो नौकरी खोजने वालों और नियोक्ताओं को जोड़ता है।
            हम नौकरी पोस्टिंग, खोज और संबंधित सेवाएं प्रदान करते हैं।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">3. उपयोगकर्ता की जिम्मेदारियां</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>आप सटीक और वास्तविक जानकारी प्रदान करने के लिए जिम्मेदार हैं</li>
            <li>आप किसी भी अवैध गतिविधि के लिए साइट का उपयोग नहीं करेंगे</li>
            <li>आप दूसरों की व्यक्तिगत जानकारी का दुरुपयोग नहीं करेंगे</li>
            <li>आप साइट के संचालन में बाधा नहीं डालेंगे</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">4. नौकरी पोस्ट करने के नियम</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>सभी नौकरी पोस्टिंग वास्तविक और सटीक होनी चाहिए</li>
            <li>भ्रामक या धोखाधड़ी वाली नौकरी पोस्टिंग प्रतिबंधित है</li>
            <li>हमें बिना सूचना के किसी भी पोस्टिंग को हटाने का अधिकार है</li>
            <li>पेड लिस्टिंग ₹299 का भुगतान करने पर 30 दिनों तक सक्रिय रहती है</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">5. बौद्धिक संपदा</h2>
          <p>
            साइट पर सभी सामग्री (टेक्स्ट, ग्राफिक्स, लोगो, सॉफ्टवेयर) LucknowKaam या उसके
            लाइसेंसकर्ताओं की संपत्ति है और कॉपीराइट कानूनों द्वारा संरक्षित है।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">6. वारंटी का अस्वीकरण</h2>
          <p>
            यह साइट &quot;जैसी है&quot; प्रदान की जाती है। हम नौकरी पोस्टिंग की सटीकता, उपलब्धता या
            गुणवत्ता की कोई गारंटी नहीं देते हैं। हम किसी भी नुकसान या क्षति के लिए उत्तरदायी नहीं हैं।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">7. सीमित देयता</h2>
          <p>
            किसी भी स्थिति में LucknowKaam इस साइट के उपयोग से उत्पन्न किसी भी प्रत्यक्ष,
            अप्रत्यक्ष, आकस्मिक, या परिणामी क्षति के लिए उत्तरदायी नहीं होगा।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">8. शासन कानून</h2>
          <p>
            ये शर्तें भारतीय कानूनों द्वारा शासित हैं। कोई भी विवाद लखनऊ, उत्तर प्रदेश की
            अदालतों के अधिकार क्षेत्र में होगा।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">9. संपर्क</h2>
          <p>
            इन शर्तों के बारे में किसी भी प्रश्न के लिए, कृपया हमसे संपर्क करें:
          </p>
          <p className="mt-2">
            ईमेल: contact@lucknowkaam.com
          </p>
        </section>
      </div>
    </div>
  );
}
