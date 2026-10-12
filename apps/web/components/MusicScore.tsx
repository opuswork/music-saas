'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useMusicScore } from '../hooks/useMusicScore'; 
import ScoreControls from './ScoreControls';
import IntervalLayer from './IntervalLayer';
import DbCenterSlurLayer from './DbCenterSlurLayer';

/** OSMD는 MusicXML lyric의 default-y를 무시하고 한 줄로 배치함 → 이 순서로 DOM에서 찾아 transform 적용 */
const GB_BASS_SCALE_LYRIC_LABELS = [
  'tonic',
  'supertonic',
  'mediant',
  'subdominant',
  'dominant',
  'submediant',
  'leading tone',
] as const;

/** SVG 사용자 좌표 기준, 음수면 왼쪽으로 이동 */
const GB_BASS_LYRIC_SHIFT_X = -10;
/** 오선에 가까운 줄(위 줄) / 아래 줄 — SVG y+ 는 아래로 */
const GB_BASS_LYRIC_ROW_HIGH = 22;
const GB_BASS_LYRIC_ROW_LOW = 46;

function applyGbBassLyricStagger(container: HTMLElement) {
  const texts = Array.from(container.querySelectorAll('svg text'));
  let i = 0;
  for (const el of texts) {
    if (i >= GB_BASS_SCALE_LYRIC_LABELS.length) break;
    const raw = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (raw !== GB_BASS_SCALE_LYRIC_LABELS[i]) continue;
    // 스크린샷처럼 위·아래 교대: tonic/mediant/dominant/leading tone(짝수) 위, supertonic/subdominant/submediant(홀수) 아래
    const pushDown = i % 2 === 0 ? GB_BASS_LYRIC_ROW_HIGH : GB_BASS_LYRIC_ROW_LOW;
    el.setAttribute(
      'transform',
      `translate(${GB_BASS_LYRIC_SHIFT_X}, ${pushDown})`
    );
    i += 1;
  }
}

export default function MusicScore({
  url,
  xml,
  caption,
}: {
  /** Public file URL (e.g. `/score-data/foo.xml`) — fetch and render */
  url?: string;
  /** Raw MusicXML string (e.g. from lesson block `content`) */
  xml?: string;
  /** OSMD에 넣지 않고 악보 프레임 아래에만 표시할 제목(예: MusicXML의 work-title 대체) */
  caption?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { osmdRef, playerRef, isPlaying, setIsPlaying, isLoaded, initOSMD, resetPlaybackState } = useMusicScore();
  const scoreSource = (url || xml || '').trim();
  const hideStems = scoreSource.includes('gb-major-scale-base-clef.xml');

  // 🌟 Ref 할당 및 초기화 에러 해결
  useEffect(() => {
    if (!containerRef.current) return;
    const rawXml = xml?.trim();
    if (rawXml) {
      initOSMD(containerRef.current, rawXml, { asRawXml: true });
    } else if (url?.trim()) {
      initOSMD(containerRef.current, url.trim());
    }
  }, [url, xml, initOSMD]);

  useLayoutEffect(() => {
    if (!isLoaded || !scoreSource.includes('gb-major-scale-base-clef.xml')) return;

    const run = () => {
      const root = containerRef.current;
      if (root) applyGbBassLyricStagger(root);
    };

    requestAnimationFrame(() => requestAnimationFrame(run));

    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(run);
    });
    ro.observe(el);
    window.addEventListener('resize', run);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', run);
    };
  }, [isLoaded, scoreSource]);

  return !url?.trim() && !xml?.trim() ? (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      No MusicXML or score URL provided.
    </div>
  ) : (
    <figure
      className={`my-10 mx-auto w-full max-w-6xl px-0 py-3 md:px-1 md:py-4 bg-white rounded-2xl shadow-xl border border-gray-100 relative ${
        hideStems ? 'hide-osmd-stems' : ''
      }`}
    >
      <style jsx global>{`
        .osmdCursor, rect[id^="cursorImg-"], [id^="cursorImg-"] {
          display: block !important;
          visibility: visible !important;
          z-index: 100 !important;
          border: 3px solid #86efac !important;
          background-color: rgba(134, 239, 172, 0.1) !important;
          height: 52px !important;
          transform: translateY(-16px);
          pointer-events: none;
        }
        .hide-osmd-stems svg .vf-stem,
        .hide-osmd-stems svg .stem {
          display: none !important;
          opacity: 0 !important;
          stroke-width: 0 !important;
        }
      `}</style>

      <ScoreControls 
        isPlaying={isPlaying} 
        isLoaded={isLoaded} 
        onToggle={() => {
          const player = playerRef.current;
          if (!player) return;
          if (player.audioContext?.state === 'suspended') player.audioContext.resume();
          if (isPlaying) {
            player.pause();
          } else {
            // 커서가 안 보이거나 reset이 안 된 상태 대비
            resetPlaybackState?.();
            const cursor = osmdRef.current?.cursor;
            if (cursor) {
              cursor.show();
              cursor.update();
            }
            player.play();
          }
          setIsPlaying(!isPlaying);
        }} 
        onStop={() => {
          playerRef.current?.stop();
          osmdRef.current?.cursor.reset();
          setIsPlaying(false);
        }}
      />

      <div className="relative border rounded-xl p-0 md:p-1 bg-white w-full min-w-0">
        {/*
          OSMD 전용 div와 인터벌 오버레이를 같은 relative 래퍼에 두어,
          오버레이 위치 계산 시 border 보정 없이 부모 기준으로 맞출 수 있게 함.
          (포털을 OSMD svg 안에 두면 리사이즈 시 removeChild 충돌 발생)
        */}
        <div className="relative w-full min-w-0">
          <div ref={containerRef} className="relative z-0 w-full min-w-0" />
          {isLoaded && scoreSource.includes('db-major-scale-asymmetrical.xml') && (
            <DbCenterSlurLayer
              osmd={osmdRef.current}
              isLoaded={isLoaded}
              containerRef={containerRef}
            />
          )}
          {isLoaded && !scoreSource.includes('db-major-scale-asymmetrical.xml') && (
            <IntervalLayer
              osmd={osmdRef.current}
              isLoaded={isLoaded}
              containerRef={containerRef}
            />
          )}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm text-slate-600 font-serif tracking-wide">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}