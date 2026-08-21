import { supabase } from "@/lib/supabase";
import { Job, CATEGORIES, INDIA_CITIES } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;

interface Props {
  params: { area: string; category: string };
  searchParams: { page?: string };
}

function getAreaName(areaSlug: string): string | undefined {
  return INDIA_CITIES.find((a) => a.toLowerCase().replace(/\s+/g, "-") === areaSlug);
}

function getCategory(catSlug: string) {
  return CATEGORIES.find((c) => c.slug === catSlug);
}

export async function generateMetadata({ params: _params2 }: Props): Promise<Metadata> {
  const params = _params2;
  const areaName = getAreaName(params.area);
  const cat = getCategory(params.category);
  if (!areaName || !cat) return { title: "नौकरी नहीं मिली" };
  return {
    title: `${areaName} में ${cat.name_hindi} की नौकरी | ${areaName} ${cat.name_hindi} Jobs | LucknowKaam`,
    description: `${areaName} में ${cat.name_hindi} की नौकरी खोजें। ${areaName} में ${cat.name_hindi} jobs available।`,
    openGraph: {
      title: `${areaName} में ${cat.name_hindi} की नौकरी`,
      description: `${areaName} में ${cat.name_hindi} की नौकरी खोजें।`,
    },
    alternates: {
      canonical: `https://lucknowkaam.vercel.app/jobs-in/${params.area}/${params.category}`,
    },
  };
}

const JOBS_PER_PAGE = 30;

async function getJobs(areaName: string, category: string, page: number): Promise<{ jobs: Job[]; total: number }> {
  try {
    const offset = (page - 1) * JOBS_PER_PAGE;
    const { data, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .eq("location_area", areaName)
      .eq("category", category)
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false })
      .range(offset, offset + JOBS_PER_PAGE - 1);
    return { jobs: (data as Job[]) || [], total: count || 0 };
  } catch {
    return { jobs: [], total: 0 };
  }
}

export default async function JobsInPage({ params, searchParams }: Props) {
  const areaName = getAreaName(params.area);
  const cat = getCategory(params.category);
  if (!areaName || !cat) notFound();

  const currentPage = parseInt(searchParams.page || "1");
  const { jobs, total } = await getJobs(areaName, params.category, currentPage);
  const totalPages = Math.ceil(total / JOBS_PER_PAGE);

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (page > 1) p.set("page", String(page));
    return `/jobs-in/${params.area}/${params.category}${p.toString() ? `?${p}` : ""}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <Link href="/jobs" className="hover:text-primary">सभी नौकरियां</Link>
        <span className="mx-2">›</span>
        <Link href={`/location/${params.area}`} className="hover:text-primary">{areaName}</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{cat.name_hindi}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary">
          {areaName} में {cat.name_hindi} की नौकरी
        </h1>
        <p className="text-text-secondary">{total} नौकरियां उपलब्ध</p>
      </div>

      <AdSenseSlot slot="category-top-728x90" />

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">{areaName} में {cat.name_hindi} की अभी कोई नौकरी नहीं है</p>
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
