import { cn } from "@/lib/utils";

type AnyMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
};

/** Extract raw text from message parts or content */
function getRawText(message: AnyMessage): string {
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    const text = message.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("");
    if (text.trim()) return text;
  }
  return message.content ?? "";
}

/** For assistant messages, try to extract the human-readable "message" field from JSON.
 *  While streaming, the JSON may be incomplete — fall back to a friendly placeholder. */
function getDisplayText(message: AnyMessage): string {
  const raw = getRawText(message);

  if (message.role !== "assistant") return raw;

  // Try to parse as JSON and extract the message field
  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const data = JSON.parse(cleaned);
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // JSON is incomplete (still streaming) — try to extract message field partially
    const match = raw.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match) {
      // Unescape basic JSON string escapes
      return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
  }

  // If it looks like JSON but we can't parse it yet, show a thinking indicator
  if (raw.trim().startsWith("{")) {
    return "✦ Planning your trip…";
  }

  return raw;
}

export function MessageBubble({ message }: { message: AnyMessage }) {
  if (message.role === "system") return null;
  const text = getDisplayText(message);
  if (!text.trim()) return null;

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-sm leading-relaxed border",
        message.role === "assistant"
          ? "bg-white text-neutral-800 border-neutral-200 shadow-sm"
          : "bg-[#F2E7E1] text-neutral-900 border-[#E8D9D0]",
      )}
    >
      {text.split("\n").map((line, i) => (
        <span key={i}>
          {line}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
