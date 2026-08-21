import { supabase } from "@/lib/supabase";
import { Job, CATEGORIES, INDIA_CITIES } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 300;

interface Props {
  params: { category: string };
  searchParams: { page?: string };
}

function getCategory(catSlug: string) {
  return CATEGORIES.find((c) => c.slug === catSlug);
}

export async function generateMetadata({ params: _params1 }: Props): Promise<Metadata> {
  const params = _params1;
  const cat = getCategory(params.category);
  const name = cat ? cat.name_hindi : params.category;
  return {
    title: `${name} की नौकरी | ${name} Jobs India | LucknowKaam`,
    description: `पूरे भारत में ${name} की नौकरी खोजें। ${name} jobs across India — delivery, driving, data entry, teaching, sales, security, retail, और दूसरी नौकरियां। ₹5,000 से ₹25,000 तक की सैलरी के साथ।`,
    openGraph: {
      title: `${name} की नौकरी - India`,
      description: `पूरे भारत में ${name} की नौकरी खोजें। Delivery, driving, data entry, teaching और हजारों ${name} jobs।`,
    },
    alternates: {
      canonical: `https://lucknowkaam.vercel.app/category/${params.category}`,
    },
  };
}

const JOBS_PER_PAGE = 30;

async function getJobs(category: string, page: number): Promise<{ jobs: Job[]; total: number }> {
  try {
    const offset = (page - 1) * JOBS_PER_PAGE;
    const { data, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .eq("category", category)
      .order("is_featured", { ascending: false })
      .order("posted_at", { ascending: false })
      .range(offset, offset + JOBS_PER_PAGE - 1);
    return { jobs: (data as Job[]) || [], total: count || 0 };
  } catch {
    return { jobs: [], total: 0 };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const currentPage = parseInt(searchParams.page || "1");
  const { jobs, total } = await getJobs(params.category, currentPage);
  const totalPages = Math.ceil(total / JOBS_PER_PAGE);

  function buildPageUrl(page: number) {
    const p = new URLSearchParams();
    if (page > 1) p.set("page", String(page));
    return `/category/${params.category}${p.toString() ? `?${p}` : ""}`;
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
              { "@type": "ListItem", position: 2, name: cat.name_hindi, item: `https://lucknowkaam.vercel.app/category/${cat.slug}` },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{cat.name_hindi}</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{cat.icon}</span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {cat.name_hindi} की नौकरी
          </h1>
          <p className="text-text-secondary">{total} नौकरियां उपलब्ध</p>
        </div>
      </div>

      <AdSenseSlot slot="category-top-728x90" />

      <div className="flex flex-wrap gap-3 mt-6 mb-8">
        <span className="text-sm font-semibold text-text-secondary">अन्य श्रेणियां:</span>
        {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {c.icon} {c.name_hindi}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="text-sm font-semibold text-text-secondary">शहर के अनुसार {cat.name_hindi}:</span>
        {INDIA_CITIES.slice(0, 10).map((a) => {
          const slug = a.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={a}
              href={`/jobs-in/${slug}/${cat.slug}`}
              className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              {a}
            </Link>
          );
        })}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">अभी कोई नौकरी नहीं है</p>
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
