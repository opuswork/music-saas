import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LessonsPage() {
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
            <h2 className="text-2xl font-bold tracking-tight">Lessons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-bold tracking-tight">Lesson 1</h3>
                <p className="text-sm text-muted-foreground">여기에 레슨을 챕터별로 정리해서 넣을 것입니다.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-bold tracking-tight">Lesson 2</h3>
                <p className="text-sm text-muted-foreground">This is a lesson</p>
              </div>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}