import { Job } from "@/types";

const CITY_STATE_MAP: Record<string, string> = {
  "Delhi": "Delhi", "Mumbai": "Maharashtra", "Bangalore": "Karnataka",
  "Bengaluru": "Karnataka", "Hyderabad": "Telangana", "Chennai": "Tamil Nadu",
  "Kolkata": "West Bengal", "Pune": "Maharashtra", "Ahmedabad": "Gujarat",
  "Lucknow": "Uttar Pradesh", "Jaipur": "Rajasthan", "Chandigarh": "Chandigarh",
  "Indore": "Madhya Pradesh", "Bhopal": "Madhya Pradesh", "Patna": "Bihar",
  "Nagpur": "Maharashtra", "Surat": "Gujarat", "Vadodara": "Gujarat",
  "Noida": "Uttar Pradesh", "Gurgaon": "Haryana", "Gurugram": "Haryana",
  "Faridabad": "Haryana", "Ghaziabad": "Uttar Pradesh", "Agra": "Uttar Pradesh",
  "Varanasi": "Uttar Pradesh", "Kanpur": "Uttar Pradesh", "Meerut": "Uttar Pradesh",
  "Coimbatore": "Tamil Nadu", "Kochi": "Kerala", "Visakhapatnam": "Andhra Pradesh",
  "Mysuru": "Karnataka", "Mysore": "Karnataka",
};

export default function JobSchema({ job }: { job: Job }) {
  const city = job.location_area || "";
  const state = CITY_STATE_MAP[city] || "Uttar Pradesh";
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
        addressLocality: city,
        addressRegion: state,
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
