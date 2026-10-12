import Link from "next/link";
import { LessonBlockRowActions } from "@/components/admin/lesson-block-row-actions";

type LessonBlockItem = {
  id: string;
  type: string;
  orderIndex: number;
  content: string | null;
  assetId?: string | null;
  practiceId?: string | null;
};

type LessonDetail = {
  id: string;
  title: string;
  orderIndex: number;
  blocks: LessonBlockItem[];
};

function getApiBase(): string {
  const raw =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, "") || "http://music-saas-api:4000";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

function preview(value: string | null | undefined, max = 140): string {
  if (!value) return "";
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > max ? `${compact.slice(0, max)}...` : compact;
}

async function fetchLessonWithBlocks(id: string): Promise<LessonDetail> {
  const url = `${getApiBase()}/lessons/${id}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to load lesson (${res.status}) ${url}\n${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as LessonDetail;
  const sortedBlocks = Array.isArray(data.blocks)
    ? [...data.blocks].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  return { ...data, blocks: sortedBlocks };
}

export default async function AdminLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await params;
  const lesson = await fetchLessonWithBlocks(id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            lessonId: <code>{lesson.id}</code> | orderIndex: {lesson.orderIndex}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/lessons/${lesson.id}/blocks/new`}
            className="rounded-md bg-[#2d6cdf] px-3 py-2 text-sm font-medium text-white hover:bg-[#255ec4]"
          >
            Add lesson block
          </Link>
          <Link
            href="/admin/lessons"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Back to lessons
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-[80px_130px_1fr_220px_220px_160px_100px] gap-3 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
          <span>Order</span>
          <span>Type</span>
          <span>Content Preview</span>
          <span>Block ID</span>
          <span>Asset ID</span>
          <span>Practice ID</span>
          <span>Actions</span>
        </div>

        {lesson.blocks.map((block) => (
          <div
            key={block.id}
            className="grid grid-cols-[80px_130px_1fr_220px_220px_160px_100px] gap-3 border-b border-gray-100 px-4 py-3 text-sm"
          >
            <span className="font-semibold">{block.orderIndex}</span>
            <span className="font-medium">{block.type}</span>
            <span className="break-words text-gray-700">{preview(block.content)}</span>
            <code className="truncate text-xs text-gray-600">{block.id}</code>
            <code className="truncate text-xs text-gray-600">{block.assetId ?? "-"}</code>
            <code className="truncate text-xs text-gray-600">{block.practiceId ?? "-"}</code>
            <LessonBlockRowActions lessonId={lesson.id} blockId={block.id} />
          </div>
        ))}

        {lesson.blocks.length === 0 && (
          <div className="px-4 py-8 text-sm text-gray-500">
            No lesson-block rows found for this lessonId.
          </div>
        )}
      </div>
    </main>
  );
}
