import Link from "next/link";

type LessonItem = {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
};

function getApiBase(): string {
  const raw =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, "") || "http://music-saas-api:4000";
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

async function fetchLessons(): Promise<LessonItem[]> {
  const url = `${getApiBase()}/lessons`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load lessons (${res.status}) from ${url}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];

  return data
    .filter(
      (item): item is LessonItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as LessonItem).id === "string" &&
        typeof (item as LessonItem).title === "string" &&
        typeof (item as LessonItem).description === "string" &&
        typeof (item as LessonItem).orderIndex === "number",
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export default async function AdminLessonListPage() {
  const lessons = await fetchLessons();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Lesson Admin</h1>
      <p className="mt-2 text-gray-600">Select a lesson to manage its lesson-blocks.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-[120px_1fr_2fr_90px] gap-3 border-b bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
          <span>Order</span>
          <span>Title</span>
          <span>Description</span>
          <span>ID</span>
        </div>

        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/admin/lessons/${lesson.id}`}
            className="grid grid-cols-[120px_1fr_2fr_90px] gap-3 border-b border-gray-100 px-4 py-3 text-sm hover:bg-blue-50"
          >
            <span className="font-medium">{lesson.orderIndex}</span>
            <span className="font-medium text-gray-900">{lesson.title}</span>
            <span className="line-clamp-2 text-gray-600">{lesson.description}</span>
            <span className="truncate text-xs text-gray-500">{lesson.id.slice(0, 8)}...</span>
          </Link>
        ))}

        {lessons.length === 0 && (
          <div className="px-4 py-8 text-sm text-gray-500">No lessons found.</div>
        )}
      </div>
    </main>
  );
}
