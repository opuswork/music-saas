import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
// ShadCN UI 컴포넌트 임포트
import { Button } from "@repo/ui/components/ui/button"; 

export default function HomePage() {
  return (
    // min-h-screen으로 전체 높이 확보, flex-col로 Header/Main/Footer 배치
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section: 반응형 패딩과 중앙 정렬 */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              
              {/* Text Content */}
              <div className="flex flex-col space-y-8 text-center lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl whitespace-pre-line">
                  {`Music Saas,\nAI-Powered`}
                </h1>
                
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground lg:mx-0 lg:text-xl">
                  Learn music theory with our interactive lessons and quizzes. Perfect for beginners and advanced students alike. 
                  AI-Powered Learning to help you learn music theory, piano, and sight reading faster and easier.
                </p>
                
                {/* CTA Buttons: ShadCN Button 사용 */}
                <div className="flex flex-col items-center gap-4 sm:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="w-full sm:w-auto px-8">
                    <a href="#">Get Started</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8">
                    <a href="#">Learn More</a>
                  </Button>
                </div>
              </div>

              {/* Hero Image: 카드 느낌의 그림자와 둥근 모서리 적용 */}
              <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none" aria-hidden="true">
                <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
                  <img
                    src="/images/monitor-screen.jpg"
                    alt="Music SaaS Interface"
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* 배경 장식 요소 (선택 사항) */}
                <div className="absolute -z-10 -top-4 -right-4 h-full w-full rounded-2xl bg-primary/10 blur-2xl" />
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}