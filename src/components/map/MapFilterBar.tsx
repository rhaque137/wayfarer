export function MapFilterBar({
  value,
  onChange,
}: {
  value: "all" | "hotel" | "attraction" | "saved";
  onChange: (value: "all" | "hotel" | "attraction" | "saved") => void;
}) {
  const items: Array<{ key: typeof value; label: string }> = [
    { key: "all", label: "All" },
    { key: "hotel", label: "Hotels" },
    { key: "attraction", label: "Attractions" },
    { key: "saved", label: "Saved items only" },
  ];
  return (
    <div className="absolute left-3 top-3 z-10 flex gap-2 rounded-full bg-white px-2 py-1 shadow">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`rounded-full px-3 py-1 text-xs ${
            value === it.key ? "bg-black text-white" : "text-muted"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

