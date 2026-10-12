import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

type LessonListItem = {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
};

async function fetchLessons(): Promise<LessonListItem[]> {
  const raw =
    process.env.LESSONS_API_BASE_URL?.replace(/\/$/, "") || "http://music-saas-api:4000";
  const base = raw.endsWith("/api") ? raw : `${raw}/api`;
  const url = `${base}/lessons`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Lessons API ${res.status}: ${url}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];

  return data
    .filter(
      (item): item is LessonListItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as LessonListItem).id === "string" &&
        typeof (item as LessonListItem).title === "string" &&
        typeof (item as LessonListItem).description === "string" &&
        typeof (item as LessonListItem).orderIndex === "number",
    )
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export default async function LessonsPage() {
  const lessons = await fetchLessons();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Banner with background image */}
          <div
            className="relative bg-cover bg-center bg-no-repeat py-20 lg:py-32"
            style={{ backgroundImage: "url(/images/music-bg.jpg)" }}
          >
            <div className="absolute inset-0 bg-black/50" aria-hidden />
            <div className="container relative z-10 mx-auto px-4 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl whitespace-pre-line drop-shadow-sm">
                  Lessons
                </h1>
                <div className="space-y-4">
                  <p className="mx-auto max-w-2xl text-lg text-white/95 lg:mx-0 lg:text-xl">
                    Our lessons are designed to help you learn music theory, piano/ear-training, and sight reading.
                  </p>
                  <p className="mx-auto max-w-2xl text-lg text-white/90 lg:mx-0 lg:text-xl">
                    Lessons are available for all levels of students, from beginners to advanced.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="w-full max-w-[1200px] mx-auto py-12 px-6">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Lessons</h2>

            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="border-b border-border bg-muted/30 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                1. Fundamentals of Music Theory
              </div>

              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start gap-4 border-b border-border px-6 py-4 last:border-b-0"
                >
                  <img
                    src="/assets/icons/clef.png"
                    alt=""
                    className="mt-1 h-8 w-8 shrink-0 object-contain"
                  />
                  <div>
                    <h3 className="text-2xl leading-tight text-foreground hover:underline">
                      <Link href={`/lessons/${lesson.id}`}>{lesson.title}</Link>
                    </h3>
                    <p className="mt-1 text-lg text-muted-foreground">
                      {lesson.description}
                    </p>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <div className="px-6 py-8 text-muted-foreground">No lessons found.</div>
              )}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}