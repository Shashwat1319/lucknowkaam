import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, INDIA_CITIES } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://lucknowkaam.vercel.app";

  let slugs: { slug: string }[] = [];
  try {
    const { data } = await supabase
      .from("jobs")
      .select("slug")
      .eq("is_active", true)
      .order("posted_at", { ascending: false })
      .limit(1000);
    slugs = (data as { slug: string }[]) || [];
  } catch {}

  const now = new Date().toISOString();
  const jobEntries = slugs.map((job) => ({
    url: `${siteUrl}/jobs/${job.slug}`,
    lastModified: now,
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
  ];
}
