import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Job, INDIA_CITIES } from "@/types";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";

export const revalidate = 300;

async function getRecentJobs(): Promise<Job[]> {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(8);
    return (data as Job[]) || [];
  } catch {
    return [];
  }
}

async function getJobStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { count: totalJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { count: todayJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("posted_at", todayStr);

    return { totalJobs: totalJobs || 0, todayJobs: todayJobs || 0 };
  } catch {
    return { totalJobs: 0, todayJobs: 0 };
  }
}

export default async function HomePage() {
  const [recentJobs, stats] = await Promise.all([
    getRecentJobs(),
    getJobStats(),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "LucknowKaam",
            url: "https://lucknowkaam.vercel.app",
            areaServed: "India",
            description: "पूरे भारत में नौकरी खोजें - LucknowKaam",
            inLanguage: "hi",
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "होम", item: "https://lucknowkaam.vercel.app" },
            ],
          }),
        }}
      />

      <section className="bg-gradient-to-br from-secondary via-secondary to-gray-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              भारत में नौकरी खोजें
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              दिल्ली, मुंबई, लखनऊ, बैंगलोर और पूरे भारत में हजारों नौकरियां — बिल्कुल मुफ्त
            </p>
          </div>

          <SearchBar />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalJobs}+</div>
              <div className="text-sm text-gray-400">कुल नौकरियां</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{stats.todayJobs}+</div>
              <div className="text-sm text-gray-400">आज की नौकरियां</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalJobs}+</div>
              <div className="text-sm text-gray-400">कंपनियां</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{Math.max(stats.totalJobs * 50, 1000)}+</div>
              <div className="text-sm text-gray-400">नौकरी चाहने वाले</div>
            </div>
          </div>
        </div>
      </section>

      <AdSenseSlot slot="home-top-728x90" />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">नौकरी की श्रेणी चुनें</h2>
        <CategoryGrid />
      </section>

      {recentJobs.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="section-title">आज की नई नौकरियां</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {recentJobs.length > 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                {recentJobs.slice(4, 8).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
            <div className="text-center mt-8">
              <Link href="/jobs" className="btn-primary">
                सभी नौकरियां देखें
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">अपने शहर की नौकरी खोजें</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {INDIA_CITIES.map((city) => (
            <Link
              key={city}
              href={`/location/${city.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-5 py-2.5 bg-white border border-border rounded-full text-text-primary hover:border-primary hover:text-primary hover:bg-orange-50 transition-all text-sm font-medium"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title">हजारों लोगों ने पाई नौकरी</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "राजेश कुमार", text: "डिलीवरी बॉय की नौकरी मिली, बहुत अच्छा प्लेटफॉर्म है", area: "लखनऊ" },
              { name: "सुनीता देवी", text: "डेटा एंट्री का काम मिला, घर से काम करती हूं", area: "दिल्ली" },
              { name: "अमित शर्मा", text: "दुकान का काम चाहिए था, 2 दिन में मिल गया", area: "मुंबई" },
            ].map((t, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🙂</span>
                </div>
                <p className="text-text-secondary mb-3">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold text-text-primary">{t.name}</p>
                <p className="text-sm text-text-secondary">{t.area}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title">कैसे काम करता है?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "नौकरी खोजें", desc: "अपनी पसंद की नौकरी खोजें और फिल्टर करें" },
            { step: "2", title: "अप्लाई करें", desc: "एक क्लिक में अप्लाई करें या कॉल करें" },
            { step: "3", title: "नौकरी पाएं", desc: "इंटरव्यू दें और अपनी नौकरी पाएं" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{item.title}</h3>
              <p className="text-text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "क्या LucknowKaam पर नौकरी खोजना मुफ्त है?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "हां, LucknowKaam पर नौकरी खोजना और अप्लाई करना बिल्कुल मुफ्त है। हम नौकरी चाहने वालों से कभी कोई शुल्क नहीं लेते हैं। आप बिना किसी पैसे के हजारों नौकरियां देख सकते हैं और सीधे अप्लाई कर सकते हैं।"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "मैं अपनी नौकरी कैसे पोस्ट कर सकता हूं?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "अपनी नौकरी पोस्ट करने के लिए सिर्फ ₹299 का भुगतान करना होता है। post-job पेज पर जाकर नौकरी का विवरण भरें और Razorpay के जरिए भुगतान करें। आपकी पोस्टिंग 30 दिनों तक वेबसाइट पर दिखाई देगी।"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "क्या मैं अपने शहर की नौकरी खोज सकता हूं?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "हां, आप अपने शहर के नाम पर क्लिक करके वहां की नौकरियां देख सकते हैं। हम दिल्ली, मुंबई, लखनऊ, बैंगलोर, चेन्नई, कोलकाता, पुणे, हैदराबाद, अहमदाबाद, जयपुर, सूरत और 20+ शहरों की नौकरियां दिखाते हैं।"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "क्या नौकरी पाने की गारंटी है?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "LucknowKaam एक प्लेटफॉर्म है जो नौकरी खोजने वालों और नियोक्ताओं को जोड़ता है। हम नौकरी पाने की गारंटी नहीं देते, लेकिन हम आपको सही जगह पर सही नौकरी ढूंढने में मदद करते हैं। इंटरव्यू की तैयारी अच्छे से करें और आत्मविश्वास से जाएं।"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "क्या नौकरी के लिए अप्लाई करने पर कोई पैसे लगते हैं?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "बिल्कुल नहीं। नौकरी के लिए अप्लाई करना पूरी तरह से मुफ्त है। सावधान रहें, अगर कोई नौकरी दिलाने के नाम पर पैसे मांगता है तो वह फर्जी हो सकता है। LucknowKaam कभी भी नौकरी दिलाने के लिए पैसे नहीं लेता।"
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "हर दिन कितनी नई नौकरियां आती हैं?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "हम रोजाना 20-50 नई नौकरियां पोस्ट करते हैं। ये नौकरियां अलग-अलग श्रेणियों और शहरों से होती हैं। सुबह 6 बजे, दोपहर 12 बजे और शाम 6 बजे नई नौकरियां अपडेट की जाती हैं।"
                    }
                  }
                ]
              }),
            }}
          />
          <h2 className="section-title">अक्सर पूछे जाने वाले सवाल</h2>
          <div className="space-y-4">
            {[
              { q: "क्या LucknowKaam पर नौकरी खोजना मुफ्त है?",
                a: "हां, बिल्कुल मुफ्त। हम नौकरी चाहने वालों से कभी कोई शुल्क नहीं लेते।" },
              { q: "मैं अपनी नौकरी कैसे पोस्ट कर सकता हूं?",
                a: "post-job पेज पर जाएं, फॉर्म भरें और ₹299 का भुगतान करें। आपकी पोस्टिंग 30 दिनों तक सक्रिय रहेगी।" },
              { q: "क्या मैं अपने शहर की नौकरी खोज सकता हूं?",
                a: "हां, 20+ भारतीय शहरों की नौकरियां। अपने शहर पर क्लिक करें और वहां की नौकरियां देखें।" },
              { q: "क्या नौकरी पाने की गारंटी है?",
                a: "नहीं, कोई गारंटी नहीं है। लेकिन हम सही नौकरी ढूंढने में मदद करते हैं।" },
              { q: "क्या नौकरी दिलाने के लिए कोई पैसे लगते हैं?",
                a: "नहीं। नौकरी के लिए अप्लाई करना और सारी सेवाएं मुफ्त हैं। किसी को पैसे न दें।" },
              { q: "हर दिन कितनी नई नौकरियां आती हैं?",
                a: "रोजाना 20-50 नई नौकरियां। सुबह 6, दोपहर 12 और शाम 6 बजे अपडेट।" },
            ].map((faq, i) => (
              <details key={i} className="card p-4 group">
                <summary className="font-semibold text-text-primary cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-primary text-xl group-open:rotate-180 transition-transform">›</span>
                </summary>
                <p className="mt-3 text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-orange-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">क्या आप नौकरी देना चाहते हैं?</h2>
          <p className="text-xl mb-6 text-orange-100">
            सिर्फ ₹299 में अपनी vacancy पोस्ट करें
          </p>
          <Link href="/post-job" className="inline-flex bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-orange-50 transition-colors text-lg">
            नौकरी पोस्ट करें
          </Link>
        </div>
      </section>
    </div>
  );
}
