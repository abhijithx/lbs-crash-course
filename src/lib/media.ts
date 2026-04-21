type MediaTokenKind = "yt" | "note";

export const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (YOUTUBE_ID_REGEX.test(value)) return value;

  const compactMatch = value.match(/([A-Za-z0-9_-]{11})(?:\b|$)/);
  if (compactMatch?.[1] && YOUTUBE_ID_REGEX.test(compactMatch[1])) return compactMatch[1];

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return YOUTUBE_ID_REGEX.test(id) ? id : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v") || "";
        return YOUTUBE_ID_REGEX.test(v) ? v : "";
      }

      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0] || "")) {
        const id = parts[1] || "";
        return YOUTUBE_ID_REGEX.test(id) ? id : "";
      }
    }
  } catch {
    // fall back
  }

  const match = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] || "";
}

export async function createMediaToken(source: string, kind: MediaTokenKind, fbToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (fbToken) {
    headers["Authorization"] = `Bearer ${fbToken}`;
  }

  const response = await fetch("/api/media/token", {
    method: "POST",
    headers,
    body: JSON.stringify({ id: source, kind }),
  });

  if (!response.ok) {
    throw new Error("Failed to create media token");
  }

  const data = (await response.json().catch(() => ({}))) as { token?: string };
  if (!data.token) {
    throw new Error("Missing media token");
  }

  return data.token;
}
