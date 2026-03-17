import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ProgramsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Banner with background image */}
          <div
            className="relative bg-cover bg-center bg-no-repeat py-20 lg:py-32"
            style={{ backgroundImage: "url(/images/colors-keyboard-bg.jpg)" }}
          >
            <div className="absolute inset-0 bg-black/50" aria-hidden />
            <div className="container relative z-10 mx-auto px-4 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl whitespace-pre-line drop-shadow-sm">
                  Programs
                </h1>
                <div className="space-y-4">
                  <p className="mx-auto max-w-2xl text-lg text-white/95 lg:mx-0 lg:text-xl">
                    Music-Saas provides a variety of programs to help you learn
                    music theory, piano/ear-training, and sight reading.
                  </p>
                  <p className="mx-auto max-w-2xl text-lg text-white/90 lg:mx-0 lg:text-xl">
                    We are trying NOT to make it boring. This is why we are
                    using AI to help you learn music theory.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="w-full max-w-[1200px] mx-auto py-12 px-6">
            {/* Feature 1 */}
            <div className="feature-border-draw group relative flex flex-wrap items-center gap-8 py-8 rounded-[30px]">
              {/* Rounded border drawn on hover (SVG follows rx/ry) */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible rounded-[30px]" aria-hidden>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="30"
                  ry="30"
                  fill="none"
                  strokeWidth="2"
                  className="stroke-foreground/40"
                />
              </svg>
              <div className="w-full p-[15px] sm:w-[35%] sm:shrink-0 sm:p-0 sm:ml-8">
                <img
                  src="/images/circle-fifth-bg.jpg"
                  alt=""
                  className="w-full shrink-0 object-cover sm:object-contain rounded-[30px]"
                />
              </div>
              <div className="flex-1 min-w-[280px] pl-[15px] sm:min-w-0 sm:flex sm:flex-col sm:items-center sm:justify-center">
                <div className="max-w-2xl sm:text-center">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Curriculum Number: Theory 101 and ...
                  </h2>
                  <h1 className="text-2xl font-bold leading-tight text-foreground mb-4">
                    Music and Theory
                  </h1>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Fundamentals of Music Theory<br />
                    You will get Practice of Music theory <br />with AI-Powered feedback
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: mobile = image on top + right-aligned text; sm+ = text left, image right (same as desktop) */}
            <div className="feature-border-draw group relative flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-0 sm:gap-8 py-8 rounded-[30px]">
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible rounded-[30px]" aria-hidden>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="30"
                  ry="30"
                  fill="none"
                  strokeWidth="2"
                  className="stroke-foreground/40"
                />
              </svg>
              <div className="order-2 sm:order-1 min-w-[280px] shrink-0 pr-[15px] text-right sm:pr-0 sm:flex sm:flex-col sm:items-center sm:justify-center sm:flex-1">
                <div className="max-w-2xl sm:ml-0 sm:text-center ml-auto">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Curriculum Number: Listening 101 and ...
                  </h2>
                  <h1 className="text-2xl font-bold leading-tight text-foreground mb-4">
                    Ear Training<br />Train yourself!
                  </h1>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Level up your Aural skills<br />
                    with AI
                  </p>
                </div>
              </div>
              <div className="order-1 sm:order-2 w-full p-[15px] sm:w-[35%] sm:shrink-0 sm:p-0 sm:mr-8">
                <img
                  src="/images/ear-training-bg.jpg"
                  alt=""
                  className="w-full shrink-0 object-cover sm:object-contain rounded-[30px]"
                />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-border-draw group relative flex flex-wrap items-center gap-8 py-8 rounded-[30px]">
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible rounded-[30px]" aria-hidden>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="30"
                  ry="30"
                  fill="none"
                  strokeWidth="2"
                  className="stroke-foreground/40"
                />
              </svg>
              <div className="w-full p-[15px] sm:w-[35%] sm:shrink-0 sm:p-0 sm:ml-8">
                <img
                  src="/images/sight-reading-bg.jpg"
                  alt=""
                  className="w-full shrink-0 object-cover sm:object-contain rounded-[30px]"
                />
              </div>
              <div className="flex-1 min-w-[280px] pl-[15px] sm:min-w-0 sm:flex sm:flex-col sm:items-center sm:justify-center">
                <div className="max-w-2xl sm:text-center">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Curriculum Number: Singing 101 and ...
                  </h2>
                  <h1 className="text-2xl font-bold leading-tight text-foreground mb-4">
                    You can be trained <br />as a singer
                  </h1>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    You will get confidence in singing!<br /> Level UP!
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}