"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import PracticeSection from "@/components/PracticeSection";
import {
  adminLessonBlockContentIssue,
  adminPracticePreviewData,
  extractYouTubeId,
  isLikelyMusicXml,
} from "@/lib/lessonBlockMedia";
import { getLessonsApiBaseForClient } from "@/lib/lessonsApiBase";
import { SummernoteField } from "./SummernoteField";

const MusicScorePreview = dynamic(() => import("@/components/MusicScore"), {
  ssr: false,
  loading: () => (
    <p className="p-6 text-center text-sm text-gray-500">Loading score preview…</p>
  ),
});

const INT32_MIN = -0x8000_0000;
const INT32_MAX = 0x7fff_ffff;

const BLOCK_TYPES = [
  "TEXT",
  "VIDEO",
  "IMAGE",
  "PDF",
  "MUSIC_SCORE",
  "PRACTICE_TOOL",
  "QUIZ",
  "AUDIO",
] as const;

export type LessonBlockFormInitial = {
  id: string;
  lessonId: string;
  type: string;
  orderIndex: number;
  content: string | null;
  assetId: string | null;
  practiceId: string | null;
};

type Props =
  | {
      mode: "create";
      lessonId: string;
      takenOrderIndices: number[];
      initial?: undefined;
    }
  | {
      mode: "edit";
      lessonId: string;
      takenOrderIndices: number[];
      initial: LessonBlockFormInitial;
    };

function parseOrderInput(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isInteger(n)) return null;
  return n;
}

const codeEditorClass =
  "w-full min-h-[220px] rounded border border-gray-300 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 " +
  "placeholder:text-slate-500 focus:border-[#2d6cdf] focus:outline-none focus:ring-1 focus:ring-[#2d6cdf]";

export function AddLessonBlockForm(props: Props) {
  const router = useRouter();
  const lessonId = props.lessonId;
  const { takenOrderIndices } = props;

  const [orderInput, setOrderInput] = useState(() => {
    if (props.mode === "edit") {
      return String(props.initial.orderIndex);
    }
    const taken = props.takenOrderIndices;
    if (taken.length === 0) return "10";
    return String(Math.max(...taken) + 1);
  });

  const orderFeedback = useMemo(() => {
    const n = parseOrderInput(orderInput);
    if (orderInput.trim() === "") {
      return "Enter an order index.";
    }
    if (n === null) {
      return "Enter a whole number.";
    }
    if (n < INT32_MIN || n > INT32_MAX) {
      return "Order index must fit in a 32-bit integer.";
    }
    if (takenOrderIndices.includes(n)) {
      return "This order index is already taken by another block in this lesson.";
    }
    return null;
  }, [orderInput, takenOrderIndices]);

  const [type, setType] = useState<string>(
    props.mode === "edit" ? props.initial.type : "TEXT",
  );
  const [content, setContent] = useState<string>(
    props.mode === "edit" ? props.initial.content || "" : "",
  );
  const [assetId, setAssetId] = useState<string>(
    props.mode === "edit" ? props.initial.assetId || "" : "",
  );
  const [practiceId, setPracticeId] = useState<string>(
    props.mode === "edit" ? props.initial.practiceId || "" : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const contentIssue = useMemo(
    () => adminLessonBlockContentIssue(type, content, practiceId, { assetId }),
    [type, content, practiceId, assetId],
  );

  const practicePreviewRows = useMemo(
    () => adminPracticePreviewData(type, content, practiceId, { assetId }),
    [type, content, practiceId, assetId],
  );

  const youtubeId = useMemo(
    () => (type === "VIDEO" ? extractYouTubeId(content) : null),
    [type, content],
  );

  async function submit() {
    setError(null);
    setPending(true);
    const base = getLessonsApiBaseForClient();

    try {
      const parsedOrder = parseOrderInput(orderInput);
      if (
        parsedOrder === null ||
        parsedOrder < INT32_MIN ||
        parsedOrder > INT32_MAX ||
        takenOrderIndices.includes(parsedOrder)
      ) {
        throw new Error(
          orderFeedback ||
            "Enter a valid, available order index (see hints below the field).",
        );
      }

      const issue = adminLessonBlockContentIssue(type, content, practiceId, {
        assetId,
      });
      if (issue) {
        throw new Error(issue);
      }

      const orderIndex = parsedOrder;

      if (props.mode === "create") {
        const res = await fetch(`${base}/lesson-blocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            type,
            orderIndex,
            content: content.trim() || null,
            assetId: assetId.trim() || null,
            practiceId: practiceId.trim() || null,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || res.statusText);
        }
      } else {
        const res = await fetch(`${base}/lesson-blocks/${props.initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            orderIndex,
            content: content.trim() || null,
            assetId: assetId.trim() || null,
            practiceId: practiceId.trim() || null,
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || res.statusText);
        }
      }

      router.push(`/admin/lessons/${lessonId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  const saveDisabled = pending || !!orderFeedback || !!contentIssue;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {props.mode === "create" ? "Add Lesson Block" : "Edit Lesson Block"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Home / Admin / Lessons /{" "}
            {props.mode === "edit" ? "Edit block" : "New block"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/admin/lessons/${lessonId}`)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
      >
        <span aria-hidden>←</span> Back to lesson blocks
      </button>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <header className="bg-[#2d6cdf] px-4 py-3 text-base font-semibold text-white">
          {props.mode === "create"
            ? "Add new Lesson Block"
            : "Edit Lesson Block"}
        </header>

        <div className="space-y-6 p-6">
          {props.mode === "edit" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Block ID
              </label>
              <input
                readOnly
                className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm"
                value={props.initial.id}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <span className="text-red-600">*</span> Lesson ID
            </label>
            <input
              readOnly
              className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm"
              value={lessonId}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <span className="text-red-600">*</span> Order index
              </label>
              <input
                type="number"
                inputMode="numeric"
                className={`w-full rounded border px-3 py-2 ${
                  orderFeedback
                    ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                    : "border-gray-300"
                }`}
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                aria-invalid={orderFeedback ? true : undefined}
              />
              <p className="mt-1 text-xs text-gray-500">
                Any whole number (for sorting within the lesson). Each index can
                only be used once per lesson.
              </p>
              {orderFeedback ? (
                <p className="mt-2 text-sm text-red-700" role="alert">
                  {orderFeedback}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <span className="text-red-600">*</span> Type
              </label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type-specific content */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            {type === "TEXT" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Content (HTML)
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Rich text below; lesson page renders HTML or Markdown.
                </p>
                <SummernoteField value={content} onChange={setContent} />
              </div>
            )}

            {type === "VIDEO" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="text-red-600">*</span> YouTube URL
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {youtubeId ? (
                  <div className="mt-4 aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-gray-300 bg-black shadow">
                    <iframe
                      title="YouTube preview"
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    Paste a watch, embed, Shorts, or youtu.be link. Preview appears
                    when the URL is recognized.
                  </p>
                )}
              </div>
            )}

            {type === "IMAGE" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="text-red-600">*</span> Image URL or upload
                </label>
                <input
                  className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://… or /images/…"
                  value={
                    content.startsWith("data:") ? "" : content
                  }
                  onChange={(e) => setContent(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-[#2d6cdf] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setContent(String(reader.result ?? ""));
                    reader.readAsDataURL(f);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Large images: prefer uploading to your CDN and pasting the URL
                  (data URLs are stored in the database).
                </p>
                {content && (content.startsWith("http") || content.startsWith("/") || content.startsWith("data:")) ? (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={content}
                      alt="Preview"
                      className="mx-auto max-h-80 max-w-full rounded object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {type === "PDF" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="text-red-600">*</span> PDF URL
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://…/file.pdf or /docs/lesson.pdf"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {content.trim() &&
                (/^https?:\/\//i.test(content.trim()) ||
                  content.trim().startsWith("/")) ? (
                  <div className="mt-4 h-[480px] overflow-hidden rounded-lg border border-gray-300 bg-white">
                    <iframe
                      title="PDF preview"
                      className="h-full w-full"
                      src={content.trim()}
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    Use an absolute URL or a path served from this site (must allow
                    embedding).
                  </p>
                )}
              </div>
            )}

            {type === "MUSIC_SCORE" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="text-red-600">*</span> MusicXML
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Paste full MusicXML. Preview renders below (same engine as the
                  lesson page). Alternatively leave this empty and use an asset URL
                  via Asset ID if your flow stores XML on the server.
                </p>
                <textarea
                  className={codeEditorClass}
                  spellCheck={false}
                  rows={14}
                  placeholder='<?xml version="1.0"?>… or <score-partwise …>'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                {isLikelyMusicXml(content) ? (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-white p-2">
                    <p className="mb-2 px-2 text-xs font-medium text-gray-600">
                      Preview
                    </p>
                    <MusicScorePreview xml={content.trim()} />
                  </div>
                ) : null}
              </div>
            )}

            {type === "PRACTICE_TOOL" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <span className="text-red-600">*</span> Practice ID
                  </label>
                <input
                  className="w-full max-w-md rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder='e.g. p7 (must match each item "groupId" in JSON)'
                  value={practiceId}
                  onChange={(e) => setPracticeId(e.target.value)}
                />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    <span className="text-red-600">*</span> Practice problems (JSON
                    array)
                  </label>
                  <p className="mb-2 text-xs text-gray-500">
                    Same shape as{" "}
                    <code className="rounded bg-gray-200 px-1">apps/web/data/practiceData.json</code>
                    : objects with{" "}
                    <code className="rounded bg-gray-200 px-1">groupId</code>,{" "}
                    <code className="rounded bg-gray-200 px-1">type</code>,{" "}
                    <code className="rounded bg-gray-200 px-1">question</code>, etc.
                    Stored on this block; lesson page uses it when present, otherwise
                    falls back to the shared file for this Practice ID.
                  </p>
                  <textarea
                    className={codeEditorClass}
                    spellCheck={false}
                    rows={16}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                {practicePreviewRows && practiceId.trim() ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Preview (Practice ID: {practiceId.trim()})
                    </p>
                    <PracticeSection
                      practiceId={practiceId.trim()}
                      inlineProblems={practicePreviewRows as any}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {type === "QUIZ" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quiz content (format TBD)
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Placeholder: raw text or JSON. The public lesson page shows this in
                  a read-only panel until the quiz schema is defined.
                </p>
                <textarea
                  className={codeEditorClass}
                  rows={10}
                  placeholder="Future: quiz JSON or QTI…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}

            {type === "AUDIO" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="text-red-600">*</span> Audio path or URL
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="/audio-data/excerpt-1-e-major-scale.mp3"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Files under{" "}
                  <code className="rounded bg-gray-200 px-1">apps/web/public/audio-data/</code>{" "}
                  are served at{" "}
                  <code className="rounded bg-gray-200 px-1">/audio-data/…</code>.
                </p>
                {content.trim() &&
                (content.trim().startsWith("/") ||
                  /^https?:\/\//i.test(content.trim())) ? (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                    <AudioPlayer src={content.trim()} title="Preview" />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {contentIssue ? (
            <p className="text-sm text-red-700" role="alert">
              {contentIssue}
            </p>
          ) : null}

          <div
            className={
              type === "PRACTICE_TOOL"
                ? "grid gap-6"
                : "grid gap-6 md:grid-cols-2"
            }
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Asset ID (optional)
              </label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                placeholder="UUID — e.g. hosted MusicXML when not using inline XML"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
              />
            </div>
            {type !== "PRACTICE_TOOL" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Practice ID (optional)
                </label>
                <input
                  className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="Practice session id or external ref"
                  value={practiceId}
                  onChange={(e) => setPracticeId(e.target.value)}
                />
              </div>
            ) : null}
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={saveDisabled}
              onClick={submit}
              className="rounded bg-[#2d6cdf] px-5 py-2 text-sm font-medium text-white hover:bg-[#255ec4] disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => router.push(`/admin/lessons/${lessonId}`)}
              className="rounded border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
