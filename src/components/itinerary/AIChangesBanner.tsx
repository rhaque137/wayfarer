interface Props {
  onAccept: () => void;
  onReject: () => void;
  summary?: string;
}

export function AIChangesBanner({ onAccept, onReject, summary }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#EAD9D0] bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="font-semibold text-[#E8472A]">
        ✦ AI suggested changes
        {summary ? <span className="mt-1 block text-xs font-medium text-neutral-600">{summary}</span> : null}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onReject}
          className="flex min-h-11 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition-colors duration-200 hover:bg-neutral-100"
        >
          ✕ Reject
        </button>
        <button
          onClick={onAccept}
          className="flex min-h-11 items-center gap-1 rounded-full border border-[#E8472A] bg-[#E8472A] px-3 py-1 text-xs text-white transition-opacity duration-200 hover:opacity-90"
        >
          ✓ Accept
        </button>
      </div>
    </div>
  );
}
