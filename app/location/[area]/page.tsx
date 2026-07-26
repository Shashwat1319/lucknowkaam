import { supabase } from "@/lib/supabase";
import { Job, INDIA_CITIES, CATEGORIES } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;

interface Props {
  params: { area: string };
  searchParams: { page?: string };
}

function getAreaName(areaSlug: string): string | undefined {
  return INDIA_CITIES.find((a) => a.toLowerCase().replace(/\s+/g, "-") === areaSlug);
}

export async function generateMetadata({ params: _params0 }: Props): Promise<Metadata> {
  const params = _params0;
  const areaName = getAreaName(params.area);
  if (!areaName) return { title: "एरिया नहीं मिला" };
  return {
    title: `${areaName} में नौकरी | ${areaName} Jobs | LucknowKaam`,
    description: `${areaName} में नौकरी खोजें। ${areaName} में डिलीवरी, दुकान, ड्राइवर और अन्य नौकरियां।`,
    openGraph: {
      title: `${areaName} में नौकरी`,
      description: `${areaName} में नौकरी खोजें।`,
    },
    alternates: {
      canonical: `https://lucknowkaam.vercel.app/location/${params.area}`,
    },
  };
}

const JOBS_PER_PAGE = 30;

async function getJobs(areaName: string, page: number): Promise<{ jobs: Job[]; total: number }> {
  try {
    const offset = (page - 1) * JOBS_PER_PAGE;
    const { data, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .eq("location_area", areaName)
      .order("posted_at", { ascending: false })
      .range(offset, offset + JOBS_PER_PAGE - 1);
    return { jobs: (data as Job[]) || [], total: count || 0 };
  } catch {
    return { jobs: [], total: 0 };
  }
}

export default async function AreaPage({ params, searchParams }: Props) {
  const areaName = getAreaName(params.area);
  if (!areaName) notFound();

  const currentPage = parseInt(searchParams.page || "1");
  const { jobs, total } = await getJobs(areaName, currentPage);
  const totalPages = Math.ceil(total / JOBS_PER_PAGE);

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (page > 1) p.set("page", String(page));
    return `/location/${params.area}${p.toString() ? `?${p}` : ""}`;
  }

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
              { "@type": "ListItem", position: 2, name: `${areaName} नौकरी`, item: `https://lucknowkaam.vercel.app/location/${params.area}` },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <Link href="/jobs" className="hover:text-primary">सभी नौकरियां</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{areaName}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary">
          {areaName} में नौकरी
        </h1>
        <p className="text-text-secondary">{total} नौकरियां उपलब्ध</p>
      </div>

      <AdSenseSlot slot="location-top-728x90" />

      <div className="flex flex-wrap gap-3 mt-6 mb-8">
        <span className="text-sm font-semibold text-text-secondary">अन्य शहर:</span>
        {INDIA_CITIES.filter((a) => a !== areaName).map((a) => (
          <Link
            key={a}
            href={`/location/${a.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {a}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="text-sm font-semibold text-text-secondary">{areaName} में नौकरी के प्रकार:</span>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/jobs-in/${params.area}/${c.slug}`}
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {c.icon} {c.name_hindi}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">{areaName} में अभी कोई नौकरी नहीं है</p>
          <Link href="/jobs" className="btn-primary">सभी नौकरियां देखें</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {currentPage > 1 && (
                <Link href={buildPageUrl(currentPage - 1)} className="btn-secondary text-sm px-4 py-2">
                  ← पिछला
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-border text-text-secondary hover:border-primary"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link href={buildPageUrl(currentPage + 1)} className="btn-secondary text-sm px-4 py-2">
                  अगला →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
