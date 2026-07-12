"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "होम", icon: "🏠" },
    { href: "/jobs", label: "खोजें", icon: "🔍" },
    { href: "/post-job", label: "पोस्ट", icon: "➕" },
    { href: "/contact", label: "संपर्क", icon: "📞" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
