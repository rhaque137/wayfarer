interface Action {
  label: string;
  prompt: string;
}

interface Props {
  actions: Action[];
  onAction: (prompt: string) => void;
}

export function QuickActions({ actions, onAction }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => onAction(a.prompt)}
          className="rounded-full border border-panel-border bg-white px-3 py-1 text-sm hover:bg-slate-50 transition"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

