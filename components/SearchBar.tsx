"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, LUCKNOW_AREAS } from "@/types";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (area) params.set("area", area);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(`/jobs${qs ? `?${qs}` : ""}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="नौकरी खोजें (जैसे: डिलीवरी बॉय, ड्राइवर...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary placeholder:text-gray-400"
          />
        </div>
        <div className="md:w-44">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary bg-white"
          >
            <option value="">सभी एरिया</option>
            {LUCKNOW_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="md:w-44">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary bg-white"
          >
            <option value="">सभी श्रेणियां</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_hindi}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary px-8 py-3 whitespace-nowrap">
          खोजें
        </button>
      </div>
    </form>
  );
}
