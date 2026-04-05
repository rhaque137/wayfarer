"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="text-lg font-bold text-[#E8472A]">Wayfarer</div>
            <p className="mt-2 text-sm text-neutral-500">
              Premium AI travel planning for people who want every detail curated.
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
              <a
                className="flex items-center gap-2 transition-all duration-200 hover:text-[#E8472A]"
                href="https://www.instagram.com"
                aria-label="Follow Wayfarer on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17" cy="7" r="1" />
                </svg>
                Instagram
              </a>
              <a
                className="flex items-center gap-2 transition-all duration-200 hover:text-[#E8472A]"
                href="https://x.com"
                aria-label="Follow Wayfarer on X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
                X
              </a>
              <a
                className="flex items-center gap-2 transition-all duration-200 hover:text-[#E8472A]"
                href="https://www.linkedin.com"
                aria-label="Follow Wayfarer on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 10v7M8 7h.01M12 10v7M12 13.5c0-1.9 2.5-2.1 2.5 0V17" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
          {[
            {
              title: "Product",
              links: [
                { label: "Trips", href: "/trips" },
                { label: "Guides", href: "/guides" },
                { label: "AI Concierge", href: "/concierge" },
                { label: "Pricing", href: "/pricing" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Contact", href: "/contact" },
                { label: "Press", href: "/press" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Support", href: "/support" },
                { label: "Community", href: "/community" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="text-sm text-neutral-600">
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-900">
                {col.title}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-all duration-200 hover:text-[#E8472A]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-xs text-neutral-400">
          © 2026 Wayfarer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
