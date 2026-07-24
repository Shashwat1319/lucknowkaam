import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, INDIA_CITIES } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://lucknowkaam.vercel.app";

  let jobs: { slug: string; posted_at: string }[] = [];
  try {
    const { data } = await supabase
      .from("jobs")
      .select("slug, posted_at")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(1000);
    jobs = (data as { slug: string; posted_at: string }[]) || [];
  } catch {}

  const jobEntries = jobs.map((job) => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: job.posted_at,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryEntries = CATEGORIES.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const locationEntries = INDIA_CITIES.map((area) => ({
    url: `${siteUrl}/location/${area.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const jobsInEntries: MetadataRoute.Sitemap = [];
  for (const area of INDIA_CITIES) {
    for (const cat of CATEGORIES) {
      jobsInEntries.push({
        url: `${siteUrl}/jobs-in/${area.toLowerCase().replace(/\s+/g, "-")}/${cat.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }
  }

  return [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/jobs`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...jobEntries,
    ...categoryEntries,
    ...locationEntries,
    ...jobsInEntries,
    {
      url: `${siteUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/post-job`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
