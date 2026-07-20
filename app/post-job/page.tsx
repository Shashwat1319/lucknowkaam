"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, INDIA_CITIES } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!document.querySelector('script[src*="razorpay"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openRazorpay = async (listingId: string) => {
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error);

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "LucknowKaam",
        description: "Paid Job Listing - 30 Days",
        order_id: order.order_id,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, listing_id: listingId }),
          });
          if (verifyRes.ok) {
            setSubmitted(true);
          } else {
            setError("पेमेंट वेरिफिकेशन में समस्या हुई। कृपया संपर्क करें।");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          name: formData.your_name,
          contact: formData.contact_phone,
        },
        theme: { color: "#FF6B35" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("पेमेंट प्रोसेसिंग में समस्या हुई। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paid-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      await openRazorpay(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-secondary mb-4">पेमेंट सफल! आपकी vacancy पोस्ट हो गई!</h1>
        <p className="text-lg text-text-secondary mb-6">
          आपकी नौकरी अब 30 दिनों तक LucknowKaam पर दिखाई देगी। आपको कंफर्मेशन WhatsApp पर मिलेगा।
        </p>
        <a href="/jobs" className="btn-primary text-lg px-8 py-4">
          सभी नौकरियां देखें
        </a>
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
            <label className="block text-sm font-semibold text-text-primary mb-1.5">शहर *</label>
              <select
                name="location_area"
                required
                value={formData.location_area}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="">शहर चुनें</option>
                {INDIA_CITIES.map((a) => (
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
            हजारों job seekers को दिखेगी। पेमेंट Razorpay के माध्यम से सुरक्षित रूप से होगा।
            UPI, क्रेडिट कार्ड, डेबिट कार्ड, नेट बैंकिंग सभी स्वीकार्य हैं।
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          {loading ? "पेमेंट प्रोसेसिंग..." : "नौकरी पोस्ट करें - ₹299"}
        </button>
      </form>
    </div>
  );
}
