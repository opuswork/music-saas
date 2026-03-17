"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Menu, X, Music } from "lucide-react"; // 아이콘 라이브러리 활용
import { cn } from "@repo/ui/lib/utils"; // shadcn 설치 시 생성된 유틸리티

const NAV_LINKS = [
  { label: "Programs", href: "/programs" },
  { label: "Lessons", href: "/lessons" },
  { label: "Practice", href: "#" },
  { label: "Exams", href: "#" },
  { label: "Tools", href: "#" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 영역 */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="Music-Saas Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Music size={20} className="text-red-500" />
          </div>
          <span>Music-Saas</span>
        </a>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* 우측 액션 버튼 (데스크톱) */}
        <div className="hidden lg:flex items-center gap-4">
          <a href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Sign up
          </a>
          <a href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Login
          </a>
          <Button variant="default" size="sm" asChild>
            <a href="#">Try Our Free Trial</a>
          </Button>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-50 grid h-screen w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-top-5 lg:hidden bg-background",
          menuOpen ? "block" : "hidden"
        )}
      >
        <div className="relative z-20 grid gap-6 rounded-md p-4">
          <nav className="grid grid-flow-row auto-rows-max gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center rounded-md p-2 text-lg font-medium hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/signup" className="text-lg font-medium hover:underline" onClick={() => setMenuOpen(false)}>
              Sign up
            </a>
            <a href="/login" className="text-lg font-medium hover:underline" onClick={() => setMenuOpen(false)}>
              Login
            </a>
            <Button className="flex-1 min-w-[140px]" asChild>
              <a href="#">Try Our Free Trial</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}