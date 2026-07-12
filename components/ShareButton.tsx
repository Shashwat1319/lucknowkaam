"use client";

interface Props {
  title: string;
  company: string;
  location: string;
  salary: string;
  slug: string;
}

export default function ShareButton({ title, company, location, salary, slug }: Props) {
  const text = `${title} - ${company}, ${location} लखनऊ ${salary} - https://lucknowkaam.vercel.app/jobs/${slug} LucknowKaam`;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)}
        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        WhatsApp
      </button>
    </div>
  );
}
