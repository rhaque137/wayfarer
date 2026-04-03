"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Common = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover-lift select-none";

const variants: Record<NonNullable<Common["variant"]>, string> = {
  primary: "border-cyan/25 bg-cyan/10 text-foreground shadow-[0_0_0_1px_rgba(0,229,255,0.15)] hover:bg-cyan/15",
  secondary: "glass text-foreground",
  ghost: "border-transparent bg-transparent text-foreground/85 hover:border-cyan/20 hover:bg-cyan/5",
  danger: "border-pink/30 bg-pink/10 text-foreground hover:bg-pink/15",
};

const sizes: Record<NonNullable<Common["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button(props: Common & Omit<HTMLMotionProps<"button">, "className" | "children">) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink(props: Common & { href: string; prefetch?: boolean }) {
  const { variant = "primary", size = "md", className, children, href, prefetch } = props;
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
