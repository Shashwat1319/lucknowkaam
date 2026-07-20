import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "प्राइवेसी पॉलिसी | Privacy Policy",
  description: "LucknowKaam की प्राइवेसी पॉलिसी — जानें कि हम आपकी जानकारी कैसे इकट्ठा और उपयोग करते हैं।",
};

export default function PrivacyPage() {
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
              { "@type": "ListItem", position: 2, name: "प्राइवेसी पॉलिसी", item: "https://lucknowkaam.vercel.app/privacy" },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">प्राइवेसी पॉलिसी</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-6">प्राइवेसी पॉलिसी</h1>
      <p className="text-sm text-text-secondary mb-8">अंतिम अपडेट: 20 जुलाई 2026</p>

      <div className="space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">1. परिचय</h2>
          <p>
            LucknowKaam (&quot;हम&quot;, &quot;हमारा&quot;, &quot;हमें&quot;) आपकी प्राइवेसी को गंभीरता से लेता है। यह पॉलिसी बताती है कि हम
            आपकी व्यक्तिगत जानकारी कैसे इकट्ठा, उपयोग और सुरक्षित रखते हैं जब आप हमारी वेबसाइट
            lucknowkaam.vercel.app का उपयोग करते हैं।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">2. हम कौन सी जानकारी इकट्ठा करते हैं</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>खाता जानकारी:</strong> जब आप नौकरी पोस्ट करते हैं, तो हम आपका नाम, फोन नंबर, ईमेल और कंपनी का नाम लेते हैं।</li>
            <li><strong>ब्राउज़िंग डेटा:</strong> हम Google Analytics और Google AdSense के माध्यम से आपकी ब्राउज़िंग गतिविधि का डेटा इकट्ठा करते हैं।</li>
            <li><strong>कुकीज़:</strong> हम और तीसरे पक्ष (जैसे Google) आपके अनुभव को बेहतर बनाने और विज्ञापन दिखाने के लिए कुकीज़ का उपयोग करते हैं।</li>
            <li><strong>डिवाइस जानकारी:</strong> आपका IP पता, ब्राउज़र प्रकार, ऑपरेटिंग सिस्टम और डिवाइस प्रकार।</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">3. हम आपकी जानकारी कैसे उपयोग करते हैं</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>नौकरी पोस्टिंग और खोज सेवाएं प्रदान करने के लिए</li>
            <li>हमारी सेवाओं को बेहतर बनाने के लिए</li>
            <li>वैयक्तिकृत विज्ञापन और सामग्री दिखाने के लिए</li>
            <li>आपसे संपर्क करने और सहायता प्रदान करने के लिए</li>
            <li>कानूनी आवश्यकताओं का पालन करने के लिए</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">4. कुकीज़ और Google AdSense</h2>
          <p className="mb-3">
            हम Google AdSense का उपयोग करते हैं जो आपकी पिछली विज़िट के आधार पर वैयक्तिकृत विज्ञापन दिखाने के लिए
            DoubleClick कुकी का उपयोग करता है। Google आपकी जानकारी को इकट्ठा और उपयोग करने के तरीके के बारे में
            अधिक जानकारी के लिए, कृपया <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google की विज्ञापन नीति</a> देखें।
          </p>
          <p>
            आप Google के <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">विज्ञापन सेटिंग</a> पेज पर जाकर
            वैयक्तिकृत विज्ञापनों से ऑप्ट-आउट कर सकते हैं।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">5. तीसरे पक्ष की सेवाएं</h2>
          <p className="mb-3">हम निम्नलिखित तीसरे पक्ष की सेवाओं का उपयोग करते हैं:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> डेटाबेस और प्रमाणीकरण के लिए</li>
            <li><strong>Google AdSense:</strong> विज्ञापन प्रदर्शन के लिए</li>
            <li><strong>Vercel:</strong> होस्टिंग के लिए</li>
            <li><strong>GitHub Actions:</strong> ऑटोमेटेड जॉब पोस्टिंग के लिए</li>
            <li><strong>Google Gemini AI:</strong> नौकरी विवरण हिंदी में अनुवाद के लिए</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">6. डेटा सुरक्षा</h2>
          <p>
            हम आपकी व्यक्तिगत जानकारी को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए
            उचित सुरक्षा उपाय करते हैं। इसमें SSL/TLS एन्क्रिप्शन, सुरक्षित API एंडपॉइंट और
            एक्सेस कंट्रोल शामिल हैं।
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">7. आपके अधिकार</h2>
          <p className="mb-3">आपको निम्नलिखित अधिकार हैं:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>अपनी व्यक्तिगत जानकारी तक पहुंचने का अधिकार</li>
            <li>अपनी जानकारी को सुधारने या हटाने का अधिकार</li>
            <li>डेटा प्रोसेसिंग पर आपत्ति करने का अधिकार</li>
            <li>अपनी जानकारी को दूसरी सेवा में स्थानांतरित करने का अधिकार</li>
            <li>कुकीज़ को अस्वीकार करने का अधिकार</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">8. संपर्क</h2>
          <p>
            अगर आपको इस पॉलिसी के बारे में कोई सवाल है, तो कृपया हमसे संपर्क करें:
          </p>
          <p className="mt-2">
            ईमेल: contact@lucknowkaam.com
          </p>
        </section>
      </div>
    </div>
  );
}
