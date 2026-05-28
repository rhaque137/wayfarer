import Link from "next/link";
import type { ReactNode } from "react";

type SimpleMarketingPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function SimpleMarketingPage({
  eyebrow = "Wayfarer",
  title,
  description,
  children,
}: SimpleMarketingPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
        <Link href="/" className="text-lg font-bold text-[#E8472A]">
          Wayfarer
        </Link>
        <div className="mt-12 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#E8472A]">{eyebrow}</div>
          <h1 className="mt-3 text-3xl font-extrabold text-neutral-950 md:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-neutral-600">{description}</p>
          {children ? <div className="mt-6 space-y-4 text-sm leading-6 text-neutral-600">{children}</div> : null}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
