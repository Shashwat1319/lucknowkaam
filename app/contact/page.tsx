"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    const form = e.currentTarget;
    const data = new FormData(form);

    const mailto = `mailto:contact@lucknowkaam.com?subject=संपर्क: ${data.get("name")}&body=नाम: ${data.get("name")}%0Aईमेल: ${data.get("email")}%0A%0A${data.get("message")}`;

    try {
      window.open(mailto, "_blank");
      setSubmitted(true);
      form.reset();
    } catch {
      setError(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary">होम</Link>
        <span className="mx-2">›</span>
        <span className="text-text-primary">संपर्क</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
        संपर्क करें
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">हमसे जुड़ें</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📧</span>
              <div>
                <p className="text-sm text-text-secondary">ईमेल</p>
                <p className="font-semibold">contact@lucknowkaam.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📞</span>
              <div>
                <p className="text-sm text-text-secondary">फोन / WhatsApp</p>
                <p className="font-semibold">+91 9999999999</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📍</span>
              <div>
                <p className="text-sm text-text-secondary">पता</p>
                <p className="font-semibold">लखनऊ, उत्तर प्रदेश, भारत</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">हमें संदेश भेजें</h2>
          {submitted ? (
            <div className="text-center py-8" role="alert">
              <p className="text-success text-lg font-semibold mb-2">✓ आपका संदेश भेज दिया गया है!</p>
              <p className="text-text-secondary">हम जल्द ही आपसे संपर्क करेंगे।</p>
              <button onClick={() => setSubmitted(false)} className="btn-primary mt-4">नया संदेश</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} ref={formRef} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="sr-only">आपका नाम</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  placeholder="आपका नाम"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="sr-only">ईमेल पता</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  placeholder="ईमेल पता"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">आपका संदेश</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="आपका संदेश"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                संदेश भेजें
              </button>
              {error && (
                <p className="text-red-500 text-sm text-center" role="alert">संदेश भेजने में समस्या हुई। कृपया contact@lucknowkaam.com पर सीधे ईमेल करें।</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
