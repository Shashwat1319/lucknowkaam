import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "हमारे बारे में",
  description: "LucknowKaam के बारे में जानें। भारत की #1 हिंदी जॉब साइट।",
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
          <strong>LucknowKaam</strong> भारत की #1 हिंदी जॉब साइट है। हमारा मकसद
          पूरे भारत में नौकरी खोजने वालों को उनकी पसंद की नौकरी
          दिलाना है। चाहे आप दिल्ली में रहते हों, मुंबई, लखनऊ या फिर किसी छोटे शहर में —
          हम आपको आपके आसपास की नौकरी ढूंढने में मदद करते हैं।
        </p>

        <p>
          भारत में हर दिन लाखों लोग नौकरी खोजते हैं। लेकिन अंग्रेजी में जॉब साइट्स की वजह से
          हिंदी बोलने वालों को काफी परेशानी होती है। LucknowKaam इस समस्या को हल करता है। हम
          पूरी जानकारी सरल हिंदी भाषा में देते हैं ताकि हर कोई आसानी से समझ सके और अप्लाई कर सके।
        </p>

        <p>
          डिलीवरी बॉय से लेकर दुकान का काम, ड्राइवर, डेटा एंट्री, टीचिंग, सेल्स और घर से काम —
          हर तरह की नौकरी आपको यहां मिलेगी। हम रोजाना नई नौकरियां अपडेट करते हैं ताकि आपको
          सबसे नए अवसरों की जानकारी मिल सके। हमारी वेबसाइट पर पहले से 100+ नौकरियां पोस्ट की जा चुकी हैं
          और यह संख्या हर दिन बढ़ रही है।
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमारा उद्देश्य</h2>
        <p>
          हमारा मुख्य उद्देश्य भारत के हर व्यक्ति तक रोजगार के अवसर पहुंचाना है। हमारा मानना है कि
          भाषा की बाधा किसी की नौकरी पाने की इच्छा में रुकावट नहीं बननी चाहिए। इसलिए हम सारी
          जानकारी हिंदी में देते हैं। साथ ही, हम सुनिश्चित करते हैं कि हर पोस्ट की गई नौकरी
          वास्तविक और भरोसेमंद हो।
        </p>
        <p>
          हम छोटे शहरों और गांवों के लोगों पर विशेष ध्यान देते हैं जहां अक्सर नौकरी के अवसरों की
          जानकारी नहीं पहुंच पाती। हमारी वेबसाइट के जरिए कोई भी व्यक्ति अपने शहर या आसपास के
          इलाके में आसानी से नौकरी खोज सकता है और सीधे कंपनी वालों से संपर्क कर सकता है।
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हम कैसे काम करते हैं</h2>
        <p>
          हमारी टीम रोजाना अलग-अलग स्रोतों से नौकरियां इकट्ठा करती है। इसमें कंपनियों की वेबसाइट,
          जॉब पोर्टल्स और सीधे नियोक्ताओं से मिली जानकारी शामिल है। हर नौकरी की जांच की जाती है
          और उसे हिंदी में अनुवाद करके आपके लिए आसान बनाया जाता है।
        </p>
        <p>
          अगर आप एक नियोक्ता हैं और अपनी कंपनी के लिए कर्मचारी चाहते हैं, तो आप सिर्फ ₹299 में
          अपनी नौकरी पोस्ट कर सकते हैं। आपकी पोस्टिंग 90 दिनों तक हमारी वेबसाइट पर दिखाई देगी
          और हजारों लोगों तक पहुंचेगी।
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमारी विशेषताएं</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {[
            { title: "100% मुफ्त", desc: "नौकरी खोजना और अप्लाई करना बिल्कुल मुफ्त है। हम नौकरी चाहने वालों से कभी पैसे नहीं लेते।" },
            { title: "पूरे भारत में", desc: "दिल्ली, मुंबई, लखनऊ, बैंगलोर, चेन्नई, कोलकाता — 20+ शहरों से नौकरियां" },
            { title: "हिंदी भाषा में", desc: "पूरी जानकारी सरल हिंदी में। कोई अंग्रेजी का झंझट नहीं, आसानी से समझें और अप्लाई करें।" },
            { title: "रोजाना अपडेट", desc: "हर दिन नई नौकरियां डाली जाती हैं। सुबह उठते ही आपको नए ऑप्शन मिल जाएंगे।" },
            { title: "आसान अप्लाई", desc: "एक क्लिक में कॉल करें या WhatsApp करें। कोई लंबा-चौड़ा फॉर्म भरने की जरूरत नहीं।" },
            { title: "सुरक्षित और भरोसेमंद", desc: "हर जॉब पोस्टिंग की जांच की जाती है। फर्जी नौकरियों से बचने के लिए सावधानी बरती जाती है।" },
          ].map((f, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-primary text-xl shrink-0 mt-0.5">✓</span>
              <div>
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमारी टीम</h2>
        <p>
          LucknowKaam की शुरुआत एक साधारण विचार से हुई — भारत में नौकरी खोजने वाले हर व्यक्ति को
          एक आसान और मुफ्त प्लेटफॉर्म देना। हमारी छोटी लेकिन समर्पित टीम लगातार मेहनत कर रही है
          ताकि आपको बेहतर से बेहतर सेवा मिल सके। हम आपके सुझावों और फीडबैक का स्वागत करते हैं।
        </p>

        <h2 className="text-2xl font-bold text-text-primary mt-8">हमसे संपर्क करें</h2>
        <p>
          अगर आपको कोई सवाल, सुझाव या शिकायत है, तो कृपया हमसे{" "}
          <Link href="/contact" className="text-primary hover:underline">
            संपर्क
          </Link>{" "}
          करें या हमें contact@lucknowkaam.com पर ईमेल करें। हम आपकी बात सुनने और आपकी मदद करने के लिए हमेशा तैयार हैं।
        </p>
      </div>
    </div>
  );
}
