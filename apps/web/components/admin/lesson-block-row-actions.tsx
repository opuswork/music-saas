"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getLessonsApiBaseForClient } from "@/lib/lessonsApiBase";

type Props = {
  lessonId: string;
  blockId: string;
};

export function LessonBlockRowActions({ lessonId, blockId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function remove() {
    if (!confirm("Delete this lesson block? This cannot be undone.")) return;
    setErr(null);
    setBusy(true);
    try {
      const base = getLessonsApiBaseForClient();
      const res = await fetch(`${base}/lesson-blocks/${blockId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        href={`/admin/lessons/${lessonId}/blocks/${blockId}/edit`}
        className="text-blue-600 hover:underline"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="text-left text-red-600 hover:underline disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
