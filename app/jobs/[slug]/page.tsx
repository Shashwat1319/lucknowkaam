import { supabase } from "@/lib/supabase";
import { Job, CATEGORIES } from "@/types";
import { formatDate, getJobTypeHindi } from "@/lib/utils";
import JobSchema from "@/components/JobSchema";
import AdSenseSlot from "@/components/AdSenseSlot";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getJob(slug: string): Promise<Job | null> {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data as Job | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) return { title: "नौकरी नहीं मिली" };

  const title = `${job.title_hindi} - Lucknow Mein Naukri | LucknowKaam`;
  const description = `${job.title_hindi} - ${job.company_name}, ${job.location_area}, Lucknow. ${job.salary_text_hindi}. ${job.experience}. ${job.qualification}.`;

  return {
    title,
    description: description.substring(0, 160),
    keywords: [
      job.title_hindi,
      job.title_english,
      `${job.location_area} नौकरी`,
      `${job.company_name} नौकरी`,
      `लखनऊ ${job.category} नौकरी`,
    ],
    openGraph: {
      title,
      description: description.substring(0, 160),
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.substring(0, 160),
    },
    alternates: {
      canonical: `https://lucknowkaam.vercel.app/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  let relatedJobs: Job[] | null = null;
  try {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .eq("category", job.category)
      .neq("id", job.id)
      .order("posted_at", { ascending: false })
      .limit(4);
    relatedJobs = data as Job[] | null;
  } catch {
    relatedJobs = null;
  }

  return (
    <>
      <JobSchema job={job} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "होम", item: "https://lucknowkaam.vercel.app" },
              { "@type": "ListItem", position: 2, name: "सभी नौकरियां", item: "https://lucknowkaam.vercel.app/jobs" },
              { "@type": "ListItem", position: 3, name: job.title_hindi, item: `https://lucknowkaam.vercel.app/jobs/${job.slug}` },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary">होम</Link>
          <span className="mx-2">›</span>
          <Link href="/jobs" className="hover:text-primary">सभी नौकरियां</Link>
          <span className="mx-2">›</span>
          <span className="text-text-primary">{job.title_hindi}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <AdSenseSlot slot="job-top-728x90" />

            <div className="card p-6 md:p-8 mt-4">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {job.is_featured && (
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">फीचर्ड</span>
                )}
                <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{getJobTypeHindi(job.job_type)}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">{job.title_hindi}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-text-secondary">कंपनी</p>
                  <p className="font-semibold">{job.company_name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">स्थान</p>
                  <Link href={`/location/${job.location_area.toLowerCase().replace(/\s+/g, "-")}`} className="font-semibold text-primary hover:underline">
                    {job.location_area}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">वेतन</p>
                  <p className="font-semibold text-success">{job.salary_text_hindi}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">प्रकाशित</p>
                  <p className="font-semibold">{formatDate(job.posted_at)}</p>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-bold text-text-primary mb-3">नौकरी का विवरण</h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">{job.description_hindi}</p>
              </div>

              {job.qualification && (
                <div className="mb-4">
                  <h3 className="font-bold text-text-primary mb-2">योग्यता</h3>
                  <p className="text-text-secondary">{job.qualification}</p>
                </div>
              )}

              {job.experience && (
                <div className="mb-6">
                  <h3 className="font-bold text-text-primary mb-2">अनुभव</h3>
                  <p className="text-text-secondary">{job.experience}</p>
                </div>
              )}

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">कैसे अप्लाई करें?</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {job.contact_number && (
                    <a
                      href={`tel:${job.contact_number}`}
                      className="btn-primary flex-1 text-center"
                    >
                      📞 {job.contact_number} पर कॉल करें
                    </a>
                  )}
                  {job.contact_number && (
                    <a
                      href={`https://wa.me/91${job.contact_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`नमस्ते, मुझे ${job.title_hindi} के लिए आवेदन करना है। (LucknowKaam)`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex-1 text-center bg-green-600 hover:bg-green-700"
                    >
                      WhatsApp पर अप्लाई करें
                    </a>
                  )}
                </div>
              </div>
            </div>

            <AdSenseSlot slot="job-bottom-728x90" />
          </div>

          <aside className="lg:w-80 shrink-0">
            <AdSenseSlot slot="job-sidebar-300x250" format="vertical" />

            {relatedJobs && relatedJobs.length > 0 && relatedJobs[0] && (
              <div className="bg-white rounded-xl shadow-sm border border-border p-5 mt-4">
                <h3 className="font-bold text-lg mb-4">इसी तरह की नौकरियां</h3>
                <div className="flex flex-col gap-3">
                  {(relatedJobs as Job[]).slice(0, 3).map((rj) => (
                    <Link
                      key={rj.id}
                      href={`/jobs/${rj.slug}`}
                      className="block p-3 rounded-lg hover:bg-orange-50 transition-colors border border-border"
                    >
                      <p className="font-semibold text-sm text-text-primary">{rj.title_hindi}</p>
                      <p className="text-xs text-text-secondary mt-1">{rj.company_name} - {rj.location_area}</p>
                      <p className="text-xs text-success mt-1">{rj.salary_text_hindi}</p>
                    </Link>
                  ))}
                </div>
                <Link href={`/category/${job.category}`} className="block text-center text-primary text-sm font-semibold mt-4 hover:underline">
                  और देखें →
                </Link>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-border p-5 mt-4">
              <h3 className="font-bold text-lg mb-3">शेयर करें</h3>
              <ShareButton
                title={job.title_hindi}
                company={job.company_name}
                location={job.location_area}
                salary={job.salary_text_hindi}
                slug={job.slug}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border p-5 mt-4">
              <h3 className="font-bold text-lg mb-3">नौकरी की श्रेणियां</h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`text-sm hover:text-primary transition-colors ${cat.slug === job.category ? "text-primary font-semibold" : "text-text-secondary"}`}
                  >
                    {cat.icon} {cat.name_hindi}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase
      .from("jobs")
      .select("slug")
      .eq("is_active", true)
      .limit(100);
    return (data || []).map((job: { slug: string }) => ({ slug: job.slug }));
  } catch {
    return [];
  }
}
