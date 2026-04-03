interface Props {
  onAccept: () => void;
  onReject: () => void;
}

export function AIChangesBanner({ onAccept, onReject }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
      <span className="flex items-center gap-1 text-blue-700">
        <span>✦</span> AI suggested changes
      </span>
      <div className="flex gap-2">
        <button
          onClick={onReject}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 border border-red-200 transition"
        >
          ✕ Reject
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50 border border-green-200 transition"
        >
          ✓ Accept
        </button>
      </div>
    </div>
  );
}

