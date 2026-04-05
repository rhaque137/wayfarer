interface Props {
  onAccept: () => void;
  onReject: () => void;
}

export function AIChangesBanner({ onAccept, onReject }: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#EAD9D0] bg-white px-4 py-3 text-sm shadow-sm">
      <span className="flex items-center gap-1 font-semibold text-[#E8472A]">
        <span>✦</span> AI suggested changes
      </span>
      <div className="flex gap-2">
        <button
          onClick={onReject}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-all duration-200"
        >
          ✕ Reject
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white bg-[#E8472A] hover:opacity-90 border border-[#E8472A] transition-all duration-200"
        >
          ✓ Accept
        </button>
      </div>
    </div>
  );
}
