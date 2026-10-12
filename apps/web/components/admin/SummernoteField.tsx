"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    jQuery?: (el: Element | Document | Window | string) => {
      summernote: (...args: unknown[]) => unknown;
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadCss(href: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.onload = () => resolve();
    document.head.appendChild(l);
    if ("sheet" in l && l.sheet) resolve();
  });
}

type SummernoteFieldProps = {
  value: string;
  onChange: (html: string) => void;
  id?: string;
};

export function SummernoteField({ value, onChange, id }: SummernoteFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);
  const [ready, setReady] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
        await loadCss(
          "https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.css",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote-lite.min.js",
        );
        if (cancelled || !hostRef.current) return;
        const $ = window.jQuery;
        if (!$ || !hostRef.current) return;
        if (!inited.current) {
          $(hostRef.current).summernote({
            height: 320,
            placeholder: "Lesson content (HTML)",
            callbacks: {
              onChange: (contents: string) => {
                onChangeRef.current(contents);
              },
            },
          });
          inited.current = true;
        }
        $(hostRef.current).summernote("code", value || "");
        setReady(true);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        const $ = window.jQuery;
        if ($ && hostRef.current && inited.current) {
          $(hostRef.current).summernote("destroy");
          inited.current = false;
        }
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !hostRef.current) return;
    const $ = window.jQuery;
    if (!$ || !inited.current) return;
    const current = String($(hostRef.current).summernote("code") || "");
    if (current !== (value || "")) {
      $(hostRef.current).summernote("code", value || "");
    }
  }, [value, ready]);

  return <div id={id} ref={hostRef} className="min-h-[320px] w-full" />;
}
