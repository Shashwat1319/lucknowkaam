import { Job } from "@/types";

export default function JobSchema({ job }: { job: Job }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title_hindi,
    description: job.description_hindi,
    datePosted: job.posted_at,
    validThrough: job.expires_at,
    employmentType: job.job_type === "full-time" ? "FULL_TIME" : job.job_type === "part-time" ? "PART_TIME" : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location_area,
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
    },
    ...(job.salary_min || job.salary_max
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min || 0,
              maxValue: job.salary_max || 0,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
