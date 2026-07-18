"use client";

import { useState } from "react";

interface Props {
  title: string;
  company: string;
  location: string;
  salary: string;
  slug: string;
}

export default function ShareButton({ title, company, location, salary, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `https://lucknowkaam.vercel.app/jobs/${slug}`;
  const text = `${title} - ${company}, ${location} ${salary} - ${url} LucknowKaam`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)}
        className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
      >
        WhatsApp
      </button>
      <button
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Facebook
      </button>
      <button
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)}
        className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Twitter / X
      </button>
      <button
        onClick={copyLink}
        className="bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
      >
        {copied ? "✓ लिंक कॉपी हो गया!" : "लिंक कॉपी करें"}
      </button>
    </div>
  );
}
