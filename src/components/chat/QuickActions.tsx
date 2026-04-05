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
          className="rounded-full border border-[#E3D6CE] bg-white px-4 py-2 text-xs font-semibold text-neutral-700 transition-all duration-200 hover:border-[#E8472A] hover:text-[#E8472A]"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
