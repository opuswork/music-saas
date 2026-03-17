"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Music } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/90 to-slate-900">
      {/* ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,200,0.35),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(90,60,180,0.2),transparent)]" />

      {/* glass card: gradient border (Figma: white 79% → 24%) + inner bg white/10, rounded 40 */}
      <div
        className="relative w-full max-w-[420px] rounded-[40px] p-[1px] shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.79) 0%, rgba(255,255,255,0.24) 100%)",
        }}
      >
        <div className="rounded-[39px] bg-white/10 px-10 py-10 backdrop-blur-xl">
            <a href="/" className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight text-white" aria-label="Music-Saas Home">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Music size={20} className="text-red-500" />
                </div>
                <span className="text-black">Music-Saas</span>
            </a>
          <p className="text-white/70 text-sm text-center mb-8">
            
          </p>

          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-white/90 text-sm font-medium mb-2 block"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-white/90 text-sm font-medium mb-2 block"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>
            <Button
              type="submit"
              className="mt-6 h-11 w-full rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90"
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-8 flex items-center gap-4">
            <span className="flex-1 border-t border-white/20" />
            <span className="text-white/60 text-xs font-medium">
              or continue with
            </span>
            <span className="flex-1 border-t border-white/20" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-white/20 bg-white/10 hover:bg-white/20"
              aria-label="Sign in with Google"
            >
              <Image
                src="/assets/icons/google-button.svg"
                alt=""
                width={24}
                height={24}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-white/20 bg-white/10 hover:bg-white/20"
              aria-label="Sign in with GitHub"
            >
              <Image
                src="/assets/icons/github-button.svg"
                alt=""
                width={24}
                height={24}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-white/20 bg-white/10 hover:bg-white/20"
              aria-label="Sign in with Facebook"
            >
              <Image
                src="/assets/icons/facebook-button.svg"
                alt=""
                width={24}
                height={24}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
