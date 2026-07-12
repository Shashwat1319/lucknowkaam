"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/types";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobDropdown, setJobDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">लखनऊ काम</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-text-secondary hover:text-primary transition-colors font-medium">
              होम
            </Link>
            <div className="relative group">
              <button
                onClick={() => setJobDropdown(!jobDropdown)}
                className="text-text-secondary hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                नौकरियां
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {jobDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg border border-border py-2 w-64 z-50" onMouseLeave={() => setJobDropdown(false)}>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 hover:text-primary transition-colors"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name_hindi}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/jobs" className="text-text-secondary hover:text-primary transition-colors font-medium">
              सभी नौकरियां
            </Link>
            <Link href="/about" className="text-text-secondary hover:text-primary transition-colors font-medium">
              हमारे बारे में
            </Link>
            <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors font-medium">
              संपर्क
            </Link>
          </nav>

          <Link
            href="/post-job"
            className="hidden md:inline-flex btn-primary text-sm px-5 py-2.5"
          >
            नौकरी पोस्ट करें
          </Link>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-border pt-4">
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-text-secondary hover:text-primary px-2 py-1" onClick={() => setMenuOpen(false)}>होम</Link>
              <div className="px-2">
                <p className="text-sm font-semibold text-text-secondary mb-2">नौकरी की श्रेणियां</p>
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary py-1.5"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name_hindi}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/jobs" className="text-text-secondary hover:text-primary px-2 py-1" onClick={() => setMenuOpen(false)}>सभी नौकरियां</Link>
              <Link href="/about" className="text-text-secondary hover:text-primary px-2 py-1" onClick={() => setMenuOpen(false)}>हमारे बारे में</Link>
              <Link href="/contact" className="text-text-secondary hover:text-primary px-2 py-1" onClick={() => setMenuOpen(false)}>संपर्क</Link>
              <Link href="/post-job" className="btn-primary text-sm text-center mt-2" onClick={() => setMenuOpen(false)}>
                नौकरी पोस्ट करें
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
