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

function getIntervalLabel(midi1: number, midi2: number): 'W' | 'H' | '' {
  const diff = Math.abs(midi2 - midi1);
  if (diff === 2) return 'W';
  if (diff === 1) return 'H';
  return '';
}

type Props = {
  osmd: any;
  isLoaded: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function IntervalLayer({ osmd, isLoaded, containerRef }: Props) {
  const [elements, setElements] = useState<
    { x1: number; x2: number; yBase: number; type: 'W' | 'H' }[]
  >([]);
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

  const calculateIntervals = useCallback(() => {
    const sheet = osmd?.GraphicSheet || osmd?.GraphicalSheet;

    if (!isLoaded || !sheet?.MeasureList?.length) {
      if (retryRef.current < 40) {
        retryRef.current++;
        setTimeout(calculateIntervals, 80);
      }
      return;
    }

    const svg = resolveHostSvg();
    if (!svg) {
      if (retryRef.current < 40) {
        retryRef.current++;
        setTimeout(calculateIntervals, 80);
      }
      return;
    }

    const run = () => {
      try {
        const measureBuckets: any[][] = [];

        for (let measureIndex = 0; measureIndex < sheet.MeasureList.length; measureIndex++) {
          const row = sheet.MeasureList[measureIndex];
          if (!row?.length) continue;
          const measure = row[0];
          if (!measure?.staffEntries?.length) continue;
          const notesInMeasure: any[] = [];

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
                  notesInMeasure.push(n);
                }
              }
            }
          }
          if (notesInMeasure.length > 0) {
            measureBuckets.push(notesInMeasure);
          }
        }

        const withGeomByMeasure: { cx: number; topY: number; midi: number }[][] = measureBuckets
          .map((measureNotes) =>
            measureNotes
              .map((n) => {
                const g = getNoteGeometryInRootSvg(n, svg);
                if (!g) return null;
                return {
                  cx: g.cx,
                  topY: g.topY,
                  midi: n.sourceNote.halfTone,
                };
              })
              .filter(Boolean) as { cx: number; topY: number; midi: number }[]
          )
          .filter((m) => m.length > 0);

        const withGeom = withGeomByMeasure.flat();

        if (withGeom.length < 2) {
          if (retryRef.current < 50) {
            retryRef.current++;
            requestAnimationFrame(() => setTimeout(calculateIntervals, 50));
          }
          return;
        }

        const sharedYBase = Math.min(...withGeom.map((w) => w.topY)) - 8;

        const newElements: { x1: number; x2: number; yBase: number; type: 'W' | 'H' }[] = [];

        for (let measureIndex = 0; measureIndex < withGeomByMeasure.length; measureIndex++) {
          const measureNotes = withGeomByMeasure[measureIndex];
          for (let i = 0; i < measureNotes.length - 1; i++) {
            const a = measureNotes[i];
            const b = measureNotes[i + 1];
            const label = getIntervalLabel(a.midi, b.midi);
            if (!label) continue;

            newElements.push({ x1: a.cx, x2: b.cx, yBase: sharedYBase, type: label });
          }

          // 마디 경계 인터벌(현재 마디 마지막 음 -> 다음 마디 첫 음)은 현재 마디 그룹에 포함.
          // 예: 장음계 4/4 두 마디일 때 표시가 [W W H W] [W W H]로 분리된다.
          const nextMeasure = withGeomByMeasure[measureIndex + 1];
          if (nextMeasure?.length) {
            const a = measureNotes[measureNotes.length - 1];
            const b = nextMeasure[0];
            const label = getIntervalLabel(a.midi, b.midi);
            if (label) {
              newElements.push({ x1: a.cx, x2: b.cx, yBase: sharedYBase, type: label });
            }
          }
        }

        setElements(newElements);
        retryRef.current = 0;
        requestAnimationFrame(syncOverlayLayout);
      } catch (e) {
        console.warn('인터벌 계산 중 오류:', e);
        setTimeout(calculateIntervals, 200);
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, [osmd, isLoaded, resolveHostSvg, syncOverlayLayout]);

  useEffect(() => {
    if (!isLoaded) return;
    calculateIntervals();
    window.addEventListener('resize', calculateIntervals);
    return () => window.removeEventListener('resize', calculateIntervals);
  }, [calculateIntervals, isLoaded]);

  if (elements.length === 0 || !overlayLayout) {
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
        <g className="osmd-interval-layer" style={{ pointerEvents: 'none' }}>
          {elements.map((el, i) => (
            <g key={i}>
              {el.type === 'W' ? (
                <polyline
                  points={`${el.x1},${el.yBase} ${el.x1},${el.yBase - 8} ${el.x2},${el.yBase - 8} ${el.x2},${el.yBase}`}
                  stroke="#2E6B8E"
                  fill="none"
                  strokeWidth={1.5}
                  vectorEffect="nonScalingStroke"
                />
              ) : (
                <polyline
                  points={`${el.x1},${el.yBase} ${(el.x1 + el.x2) / 2},${el.yBase - 10} ${el.x2},${el.yBase}`}
                  stroke="#2E6B8E"
                  fill="none"
                  strokeWidth={1.5}
                  vectorEffect="nonScalingStroke"
                />
              )}
              <text
                x={(el.x1 + el.x2) / 2}
                y={el.yBase - 15}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill="#2E6B8E"
                fontFamily="Georgia, 'Times New Roman', serif"
                style={{ pointerEvents: 'none' }}
              >
                {el.type}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
