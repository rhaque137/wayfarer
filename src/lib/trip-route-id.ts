const PROMPT_ID_PREFIX = "p_";

export function createPromptTripId(prompt: string) {
  return `${PROMPT_ID_PREFIX}${base64UrlEncode(prompt)}`;
}

export function promptFromTripId(id: string) {
  if (!id.startsWith(PROMPT_ID_PREFIX)) return null;
  return base64UrlDecode(id.slice(PROMPT_ID_PREFIX.length));
}

function base64UrlEncode(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "base64url").toString("utf8");
    }
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return decodeURIComponent(escape(atob(padded)));
  } catch {
    return null;
  }
}
