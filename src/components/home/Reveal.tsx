"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "transition-colors duration-200 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
