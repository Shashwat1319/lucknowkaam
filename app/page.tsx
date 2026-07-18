import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Job, INDIA_CITIES } from "@/types";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";

export const dynamic = "force-dynamic";

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
    const { data: allJobs } = await supabase
      .from("jobs")
      .select("id,posted_at")
      .eq("is_active", true);

    if (!allJobs) return { totalJobs: 0, todayJobs: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const todayJobs = allJobs.filter(j => j.posted_at >= todayStr).length;

    return { totalJobs: allJobs.length, todayJobs };
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
              लखनऊ में नौकरी खोजें
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
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-gray-400">कंपनियां</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">50K+</div>
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
          <h2 className="section-title">लखनऊ में हजारों लोगों ने पाई नौकरी</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "राजेश कुमार", text: "डिलीवरी बॉय की नौकरी मिली, बहुत अच्छा प्लेटफॉर्म है", area: "गोमती नगर" },
              { name: "सुनीता देवी", text: "डेटा एंट्री का काम मिला, घर से काम करती हूं", area: "हजरतगंज" },
              { name: "अमित शर्मा", text: "दुकान का काम चाहिए था, 2 दिन में मिल गया", area: "आलमबाग" },
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
