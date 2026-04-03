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
    <div className="flex items-center justify-between border-b border-panel-border px-4 py-3">
      <div
        className={[
          "flex items-center gap-2 text-sm font-medium",
          isCollapsed ? "[writing-mode:vertical-rl] [transform:rotate(180deg)]" : "",
        ].join(" ")}
      >
        <span className="text-muted">{icon}</span>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {onToggle ? (
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-muted hover:bg-slate-100 transition"
            aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
        <Code2 className="h-4 w-4 text-muted" />
      </div>
    </div>
  );
}
