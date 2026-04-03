import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring glass min-h-32 w-full resize-none rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/45",
        className,
      )}
      {...props}
    />
  );
}

