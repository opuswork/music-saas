import Link from "next/link";
import { AddLessonBlockForm } from "@/components/admin/add-lesson-block";
import { getLessonsApiBaseForServer } from "@/lib/lessonsApiBase";
import { takenOrderIndicesByOtherBlocks } from "@/lib/lessonBlockOrder";

type BlockPayload = {
  id: string;
  lessonId: string;
  type: string;
  orderIndex: number;
  content: string | null;
  assetId?: string | null;
  practiceId?: string | null;
};

type BlockRow = { id: string; orderIndex: number };

async function fetchBlock(blockId: string): Promise<BlockPayload> {
  const base = getLessonsApiBaseForServer();
  const res = await fetch(`${base}/lesson-blocks/${blockId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Failed to load block (${res.status}): ${t.slice(0, 300)}`);
  }
  return res.json() as Promise<BlockPayload>;
}

async function fetchLessonBlocks(lessonId: string): Promise<BlockRow[]> {
  const base = getLessonsApiBaseForServer();
  const res = await fetch(
    `${base}/lesson-blocks?lessonId=${encodeURIComponent(lessonId)}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Failed to load lesson blocks (${res.status}): ${t.slice(0, 300)}`);
  }
  return res.json() as Promise<BlockRow[]>;
}

export default async function AdminEditLessonBlockPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }> | { id: string; blockId: string };
}) {
  const { id: lessonIdFromRoute, blockId } = await params;
  const [block, lessonBlocks] = await Promise.all([
    fetchBlock(blockId),
    fetchLessonBlocks(lessonIdFromRoute),
  ]);

  if (block.lessonId !== lessonIdFromRoute) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-600">
          This block belongs to a different lesson ({block.lessonId}). Use the correct URL.
        </p>
        <Link href="/admin/lessons" className="mt-4 inline-block text-blue-600 hover:underline">
          Admin lessons
        </Link>
      </main>
    );
  }

  const takenOrderIndices = takenOrderIndicesByOtherBlocks(lessonBlocks, {
    mode: "edit",
    editingBlockId: block.id,
  });

  return (
    <AddLessonBlockForm
      mode="edit"
      lessonId={block.lessonId}
      takenOrderIndices={takenOrderIndices}
      initial={{
        id: block.id,
        lessonId: block.lessonId,
        type: block.type,
        orderIndex: block.orderIndex,
        content: block.content,
        assetId: block.assetId ?? null,
        practiceId: block.practiceId ?? null,
      }}
    />
  );
}
