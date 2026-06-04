import { ChevronLeft, ChevronRight, Code2 } from "lucide-react";

export function PanelHeader({
  icon,
  label,
  isCollapsed = false,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur">
      <div
        className={[
          "flex items-center gap-2 text-sm font-semibold text-neutral-900",
          isCollapsed ? "[writing-mode:vertical-rl] [transform:rotate(180deg)]" : "",
        ].join(" ")}
      >
        <span className="text-neutral-500">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {onToggle ? (
          <button
            onClick={onToggle}
            className="rounded-full border border-neutral-200 p-1 text-neutral-500 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
        <Code2 aria-hidden="true" className="h-4 w-4 text-neutral-400" />
      </div>
    </div>
  );
}
