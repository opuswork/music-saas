'use client';

import {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  type RefObject,
  type CSSProperties,
} from 'react';
import {
  getNoteGeometryInRootSvg,
  measureOverlayLayout,
  pickMainScoreSvg,
} from './scoreOverlayUtils';

/** Db3 — 악보 중심(tonic) 음. 다른 조표에서 바뀌면 상수만 조정 */
const CENTER_MIDI = 49;

type SlurSpec = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  yPeak: number;
  label: string;
  stroke: string;
  fill: string;
};

type Props = {
  osmd: any;
  isLoaded: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function DbCenterSlurLayer({ osmd, isLoaded, containerRef }: Props) {
  const [slurs, setSlurs] = useState<SlurSpec[]>([]);
  const [overlayLayout, setOverlayLayout] = useState<{
    viewBox: string;
    style: CSSProperties;
  } | null>(null);
  const retryRef = useRef(0);

  const resolveHostSvg = useCallback(() => {
    const root = containerRef.current;
    if (!root) return null;
    return pickMainScoreSvg(root);
  }, [containerRef]);

  const syncOverlayLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const next = measureOverlayLayout(el);
    setOverlayLayout(next);
  }, [containerRef]);

  useLayoutEffect(() => {
    if (!isLoaded) {
      setOverlayLayout(null);
      return;
    }
    syncOverlayLayout();
  }, [isLoaded, syncOverlayLayout, osmd]);

  useEffect(() => {
    if (!isLoaded) return;
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(syncOverlayLayout);
    });
    ro.observe(el);
    window.addEventListener('resize', syncOverlayLayout);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', syncOverlayLayout);
    };
  }, [isLoaded, containerRef, syncOverlayLayout]);

  const buildSlurs = useCallback(() => {
    const sheet = osmd?.GraphicSheet || osmd?.GraphicalSheet;

    if (!isLoaded || !sheet?.MeasureList?.length) {
      if (retryRef.current < 40) {
        retryRef.current++;
        setTimeout(buildSlurs, 80);
      }
      return;
    }

    const svg = resolveHostSvg();
    if (!svg) {
      if (retryRef.current < 40) {
        retryRef.current++;
        setTimeout(buildSlurs, 80);
      }
      return;
    }

    const run = () => {
      try {
        const notesInOrder: { cx: number; topY: number; midi: number }[] = [];

        for (let measureIndex = 0; measureIndex < sheet.MeasureList.length; measureIndex++) {
          const row = sheet.MeasureList[measureIndex];
          if (!row?.length) continue;
          const measure = row[0];
          if (!measure?.staffEntries?.length) continue;

          for (const staffEntry of measure.staffEntries) {
            const gves = staffEntry?.graphicalVoiceEntries;
            if (!gves?.length) continue;
            for (const gve of gves) {
              const notes = gve?.notes;
              if (!notes?.length) continue;
              for (const n of notes) {
                if (
                  n?.sourceNote &&
                  typeof n.sourceNote.halfTone === 'number' &&
                  n?.PositionAndShape
                ) {
                  const g = getNoteGeometryInRootSvg(n, svg);
                  if (!g) continue;
                  notesInOrder.push({
                    cx: g.cx,
                    topY: g.topY,
                    midi: n.sourceNote.halfTone,
                  });
                }
              }
            }
          }
        }

        notesInOrder.sort((a, b) => a.cx - b.cx);

        let centerIdx = notesInOrder.findIndex((n) => n.midi === CENTER_MIDI);
        if (centerIdx < 0 && notesInOrder.length > 0) {
          centerIdx = Math.floor(notesInOrder.length / 2);
        }

        if (centerIdx < 0 || notesInOrder.length < 3) {
          if (retryRef.current < 50) {
            retryRef.current++;
            requestAnimationFrame(() => setTimeout(buildSlurs, 50));
          }
          return;
        }

        const layers: {
          label: string;
          stroke: string;
          fill: string;
          peakDy: number;
        }[] = [
          { label: 'second', stroke: '#5eb3d4', fill: '#4a9ec4', peakDy: 14 },
          { label: 'third', stroke: '#1e3a5f', fill: '#1e3a5f', peakDy: 30 },
          { label: 'fifth', stroke: '#c53030', fill: '#c53030', peakDy: 48 },
        ];

        const next: SlurSpec[] = [];
        const headR = 3.5;

        for (let i = 0; i < layers.length; i++) {
          const step = i + 1;
          const layer = layers[i];
          const C = notesInOrder[centerIdx];

          /** 왼쪽: (center−step) ↔ center */
          if (centerIdx - step >= 0) {
            const L = notesInOrder[centerIdx - step];
            const y1 = L.topY + headR;
            const y2 = C.topY + headR;
            const yRef = Math.min(y1, y2);
            const yPeak = yRef - layer.peakDy;
            next.push({
              x1: L.cx,
              x2: C.cx,
              y1,
              y2,
              yPeak,
              label: layer.label,
              stroke: layer.stroke,
              fill: layer.fill,
            });
          }

          /** 오른쪽: center ↔ (center+step) */
          if (centerIdx + step < notesInOrder.length) {
            const R = notesInOrder[centerIdx + step];
            const y1 = C.topY + headR;
            const y2 = R.topY + headR;
            const yRef = Math.min(y1, y2);
            const yPeak = yRef - layer.peakDy;
            next.push({
              x1: C.cx,
              x2: R.cx,
              y1,
              y2,
              yPeak,
              label: layer.label,
              stroke: layer.stroke,
              fill: layer.fill,
            });
          }
        }

        setSlurs(next);
        retryRef.current = 0;
        requestAnimationFrame(syncOverlayLayout);
      } catch (e) {
        console.warn('Db 중심 슬러 계산 중 오류:', e);
        setTimeout(buildSlurs, 200);
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [osmd, isLoaded, resolveHostSvg, syncOverlayLayout]);

  useEffect(() => {
    if (!isLoaded) return;
    buildSlurs();
    window.addEventListener('resize', buildSlurs);
    return () => window.removeEventListener('resize', buildSlurs);
  }, [buildSlurs, isLoaded]);

  if (slurs.length === 0 || !overlayLayout) {
    return null;
  }

  return (
    <div style={overlayLayout.style} className="overflow-visible">
      <svg
        width="100%"
        height="100%"
        viewBox={overlayLayout.viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <g className="db-center-slur-layer" style={{ pointerEvents: 'none' }}>
          {slurs.map((s, i) => {
            const xm = (s.x1 + s.x2) / 2;
            return (
              <g key={i}>
                <path
                  d={`M ${s.x1} ${s.y1} Q ${xm} ${s.yPeak} ${s.x2} ${s.y2}`}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  vectorEffect="nonScalingStroke"
                />
                <text
                  x={xm}
                  y={s.yPeak - 6}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill={s.fill}
                  fontFamily="Georgia, 'Times New Roman', serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
