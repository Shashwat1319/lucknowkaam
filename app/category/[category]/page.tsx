import { supabase } from "@/lib/supabase";
import { Job, CATEGORIES } from "@/types";
import JobCard from "@/components/JobCard";
import AdSenseSlot from "@/components/AdSenseSlot";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { category: string };
}

function getCategory(catSlug: string) {
  return CATEGORIES.find((c) => c.slug === catSlug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategory(params.category);
  const name = cat ? cat.name_hindi : params.category;
  return {
    title: `${name} की नौकरी | ${name} Jobs India | LucknowKaam`,
    description: `पूरे भारत में ${name} की नौकरी खोजें। ${name} jobs across India।`,
    openGraph: {
      title: `${name} की नौकरी - India`,
      description: `पूरे भारत में ${name} की नौकरी खोजें।`,
    },
  };
}

async function getJobs(category: string): Promise<Job[]> {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("posted_at", { ascending: false })
      .limit(50);
    return (data as Job[]) || [];
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const jobs = await getJobs(params.category);

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
          <p className="text-text-secondary">{jobs.length} नौकरियां उपलब्ध</p>
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

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-text-secondary mb-4">अभी कोई नौकरी नहीं है</p>
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
