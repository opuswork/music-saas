/** YouTube watch / embed / shorts / youtu.be → 11-char video id */
export function extractYouTubeId(input: string): string | null {
  const u = input.trim();
  const m = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

export function isLikelyMusicXml(raw: string): boolean {
  const s = raw.trim();
  if (!s.startsWith("<")) return false;
  if (s.startsWith("<?xml")) return true;
  return (
    s.includes("<score-partwise") ||
    s.includes("<score-timewise") ||
    s.includes("<!DOCTYPE score-partwise")
  );
}

export function parsePracticeJsonArray(content: string): unknown[] | null {
  const c = content.trim();
  if (!c) return null;
  try {
    const p = JSON.parse(c) as unknown;
    return Array.isArray(p) ? p : null;
  } catch {
    return null;
  }
}

/** Client-side validation before Save (admin lesson block form). */
export function adminLessonBlockContentIssue(
  type: string,
  content: string,
  practiceId: string,
  options?: { assetId?: string },
): string | null {
  const t = type.trim().toUpperCase();
  const c = content.trim();
  const assetId = (options?.assetId ?? "").trim();
  switch (t) {
    case "TEXT":
      return null;
    case "VIDEO":
      if (!c) return "Paste a YouTube URL.";
      if (!extractYouTubeId(c)) return "Not a recognized YouTube URL.";
      return null;
    case "IMAGE":
      if (!c) return "Provide an image URL or upload an image.";
      return null;
    case "PDF":
      if (!c) return "Provide a PDF URL.";
      if (!/^https?:\/\//i.test(c) && !c.startsWith("/")) {
        return "PDF URL must start with http(s):// or /.";
      }
      return null;
    case "MUSIC_SCORE": {
      if (!c && !assetId) {
        return "Paste MusicXML here, or enter an Asset ID whose URL points to a .xml file.";
      }
      if (c && !isLikelyMusicXml(c)) {
        return "Content does not look like MusicXML.";
      }
      return null;
    }
    case "PRACTICE_TOOL": {
      const pid = practiceId.trim();
      if (!pid) return "Practice ID is required (e.g. p7).";
      const arr = parsePracticeJsonArray(content);
      if (!content.trim()) return "Paste a JSON array of practice problems.";
      if (!arr) return "Content must be valid JSON array.";
      if (arr.length === 0) return "Add at least one practice problem object.";
      for (let i = 0; i < arr.length; i++) {
        const row = arr[i];
        if (typeof row !== "object" || row === null) {
          return `Item ${i + 1} must be an object.`;
        }
        const gid = (row as { groupId?: string }).groupId;
        if (gid !== pid) {
          return `Item ${i + 1}: groupId must be "${pid}" (matches Practice ID).`;
        }
      }
      return null;
    }
    case "QUIZ":
      return null;
    case "AUDIO":
      if (!c) return "Enter audio path or URL (e.g. /audio-data/file.mp3).";
      if (!c.startsWith("/") && !/^https?:\/\//i.test(c)) {
        return "Audio src must start with / or http(s)://.";
      }
      return null;
    default:
      return null;
  }
}

/** Parsed practice array for preview when valid; otherwise null. */
export function adminPracticePreviewData(
  type: string,
  content: string,
  practiceId: string,
  options?: { assetId?: string },
): unknown[] | null {
  if (type.trim().toUpperCase() !== "PRACTICE_TOOL") return null;
  if (adminLessonBlockContentIssue(type, content, practiceId, options)) {
    return null;
  }
  return parsePracticeJsonArray(content);
}
