import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring glass h-12 w-full rounded-xl px-4 text-sm text-foreground placeholder:text-foreground/45",
        className,
      )}
      {...props}
    />
  );
}

