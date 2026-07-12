"use client";

import { useState } from "react";
import { CATEGORIES, LUCKNOW_AREAS } from "@/types";

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_phone: "",
    whatsapp_number: "",
    job_title: "",
    job_description: "",
    salary: "",
    location_area: "",
    category: "",
    your_name: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/paid-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-secondary mb-4">फॉर्म सबमिट हो गया!</h1>
        <p className="text-lg text-text-secondary mb-6">
          आपका फॉर्म सबमिट हो गया है। कृपया WhatsApp पर संपर्क करें:
        </p>
        <a
          href={`https://wa.me/919999999999?text=${encodeURIComponent("नमस्ते, मैंने LucknowKaam पर जॉब पोस्ट किया है। कृपया पेमेंट कंफर्म करें।")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-lg px-8 py-4"
        >
          WhatsApp पर संपर्क करें
        </a>
        <p className="text-sm text-text-secondary mt-4">
          पेमेंट कंफर्म होने के बाद आपकी vacancy 30 दिन तक लाइव रहेगी।
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">नौकरी पोस्ट करें</h1>
        <p className="text-lg text-text-secondary">
          अपनी vacancy पोस्ट करें और हजारों job seekers तक पहुंचे
        </p>
        <div className="inline-block bg-orange-50 text-primary font-bold text-xl px-6 py-3 rounded-lg mt-4">
          सिर्फ ₹299 में 30 दिन तक आपकी vacancy
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">कंपनी/दुकान का नाम *</label>
            <input
              type="text"
              name="company_name"
              required
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="जैसे: शर्मा जनरल स्टोर"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">आपका नाम *</label>
            <input
              type="text"
              name="your_name"
              required
              value={formData.your_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="आपका पूरा नाम"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">फोन नंबर *</label>
            <input
              type="tel"
              name="contact_phone"
              required
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="9999999999"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">WhatsApp नंबर *</label>
            <input
              type="tel"
              name="whatsapp_number"
              required
              value={formData.whatsapp_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="9999999999"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">नौकरी का शीर्षक *</label>
            <input
              type="text"
              name="job_title"
              required
              value={formData.job_title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="जैसे: डिलीवरी बॉय चाहिए"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">नौकरी का विवरण *</label>
            <textarea
              name="job_description"
              required
              rows={4}
              value={formData.job_description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="नौकरी के बारे में पूरी जानकारी दें..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">वेतन</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="जैसे: ₹8,000 - ₹12,000 प्रति महीना"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">लोकेशन एरिया *</label>
            <select
              name="location_area"
              required
              value={formData.location_area}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">एरिया चुनें</option>
              {LUCKNOW_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">श्रेणी *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="">श्रेणी चुनें</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name_hindi}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-text-secondary">
            <strong className="text-primary">₹299</strong> में 30 दिन तक आपकी vacancy
            हजारों job seekers को दिखेगी। फॉर्म submit करने के बाद WhatsApp पर
            पेमेंट कंफर्म करें। UPI पेमेंट स्वीकार्य है।
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          {loading ? "सबमिट हो रहा है..." : "नौकरी पोस्ट करें - ₹299"}
        </button>
      </form>
    </div>
  );
}
