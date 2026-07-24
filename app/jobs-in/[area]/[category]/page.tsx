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
}

function getAreaName(areaSlug: string): string | undefined {
  return INDIA_CITIES.find((a) => a.toLowerCase().replace(/\s+/g, "-") === areaSlug);
}

function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  const params: { area: string; category: string }[] = [];
  for (const area of INDIA_CITIES) {
    for (const cat of CATEGORIES) {
      params.push({
        area: area.toLowerCase().replace(/\s+/g, "-"),
        category: cat.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const areaName = getAreaName(params.area);
  const cat = getCategory(params.category);
  if (!areaName || !cat) return { title: "पेज नहीं मिला" };

  const name = cat.name_hindi;
  return {
    title: `${areaName} में ${name} की नौकरी | ${areaName} ${cat.name_english} Jobs`,
    description: `${areaName} में ${name} की नौकरी खोजें। ${areaName} में ${name} के लिए ताज़ा भर्ती।`,
    openGraph: {
      title: `${areaName} में ${name} की नौकरी`,
      description: `${areaName} में ${name} की नौकरी खोजें।`,
    },
  };
}

async function getJobs(areaName: string, category: string): Promise<Job[]> {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .eq("location_area", areaName)
      .eq("category", category)
      .order("posted_at", { ascending: false })
      .limit(50);
    return (data as Job[]) || [];
  } catch {
    return [];
  }
}

export default async function JobsInPage({ params }: Props) {
  const areaName = getAreaName(params.area);
  const cat = getCategory(params.category);
  if (!areaName || !cat) notFound();

  const jobs = await getJobs(areaName, params.category);

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
              { "@type": "ListItem", position: 2, name: `${areaName} में नौकरी`, item: `https://lucknowkaam.vercel.app/location/${params.area}` },
              { "@type": "ListItem", position: 3, name: cat.name_hindi, item: `https://lucknowkaam.vercel.app/jobs-in/${params.area}/${params.category}` },
            ],
          }),
        }}
      />

      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <Link href="/jobs" className="hover:text-primary">सभी नौकरियां</Link>
        <span className="mx-2">›</span>
        <Link href={`/location/${params.area}`} className="hover:text-primary">{areaName}</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">{cat.name_hindi}</span>
      </nav>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl">{cat.icon}</span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">
            {areaName} में {cat.name_hindi} की नौकरी
          </h1>
          <p className="text-text-secondary">{jobs.length} नौकरियां उपलब्ध</p>
        </div>
      </div>

      <AdSenseSlot slot="category-top-728x90" />

      <div className="flex flex-wrap gap-3 mt-6 mb-8">
        <span className="text-sm font-semibold text-text-secondary">इस शहर में:</span>
        {CATEGORIES.filter((c) => c.slug !== params.category).map((c) => (
          <Link
            key={c.slug}
            href={`/jobs-in/${params.area}/${c.slug}`}
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {c.icon} {c.name_hindi}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="text-sm font-semibold text-text-secondary">अन्य शहर:</span>
        {INDIA_CITIES.filter((a) => a !== areaName).map((a) => {
          const slug = a.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={a}
              href={`/jobs-in/${slug}/${params.category}`}
              className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              {a}
            </Link>
          );
        })}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">
            {areaName} में {cat.name_hindi} की अभी कोई नौकरी नहीं है
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/category/${params.category}`} className="btn-primary">
              सभी {cat.name_hindi} देखें
            </Link>
            <Link href={`/location/${params.area}`} className="btn-secondary">
              {areaName} की सभी नौकरियां
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
