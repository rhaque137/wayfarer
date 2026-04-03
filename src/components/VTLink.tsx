"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";

export function VTLink({
  href,
  children,
  ...rest
}: LinkProps & { children: React.ReactNode; className?: string }) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(e) => {
        const url = typeof href === "string" ? href : href.pathname ?? "/";
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const start = document.startViewTransition?.bind(document);
        if (!start) {
          router.push(url);
          return;
        }
        start(() => router.push(url));
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
