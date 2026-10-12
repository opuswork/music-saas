import { AddLessonBlockForm } from "@/components/admin/add-lesson-block";
import { getLessonsApiBaseForServer } from "@/lib/lessonsApiBase";
import { takenOrderIndicesByOtherBlocks } from "@/lib/lessonBlockOrder";

type BlockRow = { id: string; orderIndex: number };

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
  const rows = (await res.json()) as BlockRow[];
  return rows;
}

export default async function AdminNewLessonBlockPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await params;
  const blocks = await fetchLessonBlocks(id);
  const takenOrderIndices = takenOrderIndicesByOtherBlocks(blocks, {
    mode: "create",
  });

  return (
    <AddLessonBlockForm
      mode="create"
      lessonId={id}
      takenOrderIndices={takenOrderIndices}
    />
  );
}
