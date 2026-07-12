import { supabase } from "@/lib/supabase";
import { Job, LUCKNOW_AREAS } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { area: string };
}

function getAreaName(areaSlug: string): string | undefined {
  return LUCKNOW_AREAS.find((a) => a.toLowerCase().replace(/\s+/g, "-") === areaSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const areaName = getAreaName(params.area);
  if (!areaName) return { title: "एरिया नहीं मिला" };
  return {
    title: `${areaName} लखनऊ में नौकरी | ${areaName} Jobs Lucknow | LucknowKaam`,
    description: `${areaName}, लखनऊ में नौकरी खोजें। ${areaName} में डिलीवरी, दुकान, ड्राइवर और अन्य नौकरियां।`,
    openGraph: {
      title: `${areaName} लखनऊ में नौकरी`,
      description: `${areaName}, लखनऊ में नौकरी खोजें।`,
    },
  };
}

async function getJobs(areaName: string): Promise<Job[]> {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .eq("location_area", areaName)
      .order("posted_at", { ascending: false })
      .limit(50);
    return (data as Job[]) || [];
  } catch {
    return [];
  }
}

export default async function AreaPage({ params }: Props) {
  const areaName = getAreaName(params.area);
  if (!areaName) notFound();

  const jobs = await getJobs(areaName);

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
          {areaName}, लखनऊ में नौकरी
        </h1>
        <p className="text-text-secondary">{jobs.length} नौकरियां उपलब्ध</p>
      </div>

      <AdSenseSlot slot="location-top-728x90" />

      <div className="flex flex-wrap gap-3 mt-6 mb-8">
        <span className="text-sm font-semibold text-text-secondary">अन्य एरिया:</span>
        {LUCKNOW_AREAS.filter((a) => a !== areaName).map((a) => (
          <Link
            key={a}
            href={`/location/${a.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {a}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">{areaName} में अभी कोई नौकरी नहीं है</p>
          <Link href="/jobs" className="btn-primary">सभी नौकरियां देखें</Link>
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
