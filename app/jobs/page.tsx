import { supabase } from "@/lib/supabase";
import { Job, CATEGORIES, INDIA_CITIES } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "भारत में सभी नौकरियां",
  description: "दिल्ली, मुंबई, बैंगलोर, लखनऊ और पूरे भारत में उपलब्ध सभी नौकरियां देखें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री, टीचिंग और हजारों नौकरियां।",
  openGraph: {
    title: "भारत में सभी नौकरियां | LucknowKaam",
    description: "पूरे भारत में उपलब्ध सभी नौकरियां देखें।",
  },
};

interface Props {
  searchParams: { [key: string]: string | undefined };
}

async function getJobs(params: Props["searchParams"]): Promise<Job[]> {
  try {
    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("posted_at", { ascending: false });

    if (params.q) {
      query = query.ilike("title_hindi", `%${params.q}%`);
    }
    if (params.area) {
      query = query.eq("location_area", params.area);
    }
    if (params.category) {
      query = query.eq("category", params.category);
    }

    const { data } = await query.limit(50);
    return (data as Job[]) || [];
  } catch {
    return [];
  }
}

export default async function JobsPage({ searchParams }: Props) {
  const jobs = await getJobs(searchParams);
  const activeCategory = searchParams.category || "";
  const activeArea = searchParams.area || "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "होम", item: "https://lucknowkaam.vercel.app" },
              { "@type": "ListItem", position: 2, name: "सभी नौकरियां", item: "https://lucknowkaam.vercel.app/jobs" },
            ],
          }),
        }}
      />

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-border p-5 sticky top-24">
            <h3 className="font-bold text-lg mb-4">फिल्टर</h3>

            <div className="mb-5">
              <h4 className="font-semibold text-sm text-text-secondary mb-2">श्रेणी</h4>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/jobs"
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${!activeCategory ? "bg-primary text-white" : "hover:bg-gray-100 text-text-secondary"}`}
                >
                  सभी नौकरियां
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/jobs?category=${cat.slug}`}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${activeCategory === cat.slug ? "bg-primary text-white" : "hover:bg-gray-100 text-text-secondary"}`}
                  >
                    {cat.icon} {cat.name_hindi}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-text-secondary mb-2">शहर</h4>
              <div className="flex flex-col gap-1.5">
                {INDIA_CITIES.map((area) => (
                  <Link
                    key={area}
                    href={`/jobs?area=${area}`}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${activeArea === area ? "bg-primary text-white" : "hover:bg-gray-100 text-text-secondary"}`}
                  >
                    {area}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
            {searchParams.q
              ? `"${searchParams.q}" के लिए नौकरियां`
              : "भारत में सभी नौकरियां"}
          </h1>
          <p className="text-text-secondary mb-6">
            {jobs.length} नौकरियां उपलब्ध
          </p>

          <AdSenseSlot slot="jobs-top-728x90" />

          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-text-secondary mb-4">कोई नौकरी नहीं मिली</p>
              <Link href="/jobs" className="btn-primary">सभी नौकरियां देखें</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map((job, idx) => (
                <>
                  <JobCard key={job.id} job={job} />
                  {idx === 3 && <AdSenseSlot slot="jobs-middle-336x280" />}
                </>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
