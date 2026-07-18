import Link from "next/link";
import { Job } from "@/types";
import { timeAgo, getJobTypeHindi } from "@/lib/utils";

export default function JobCard({ job }: { job: Job }) {
  const slug = job.slug || `${job.title_english.toLowerCase().replace(/\s+/g, "-")}-${job.location_area.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Link href={`/jobs/${slug}`}>
      <div className="card p-5 h-full flex flex-col hover:border-primary/30 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-text-secondary mb-1">{job.company_name}</p>
            <h3 className="text-lg font-bold text-text-primary leading-tight">{job.title_hindi}</h3>
          </div>
          {job.is_featured && (
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
              फीचर्ड
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          <span className="flex items-center gap-1 text-text-secondary">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location_area}
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary_text_hindi || `${job.salary_min ? "₹" + job.salary_min : ""}${job.salary_max ? " - ₹" + job.salary_max : ""}`}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
            {getJobTypeHindi(job.job_type)}
          </span>
          <span className="text-xs text-text-secondary">{timeAgo(job.posted_at)}</span>
        </div>

        <div className="mt-auto">
          <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all">
            अभी अप्लाई करें
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
