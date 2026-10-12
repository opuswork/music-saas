import type { CSSProperties } from 'react';

/** 뷰포트 좌표 → 해당 svg의 사용자 좌표(viewBox와 일치) */
export function clientPointToSvgUser(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return { x: clientX, y: clientY };
  }
  return pt.matrixTransform(ctm.inverse());
}

export function getNoteGeometryInRootSvg(
  note: any,
  svg: SVGSVGElement
): { cx: number; topY: number } | null {
  try {
    if (typeof note.getSVGGElement === 'function') {
      const g = note.getSVGGElement() as SVGGElement | null;
      if (g && svg.contains(g)) {
        const r = g.getBoundingClientRect();
        if (r.width <= 0 && r.height <= 0) return null;
        const cx = r.left + r.width / 2;
        const top = r.top;
        const center = clientPointToSvgUser(svg, cx, r.top + r.height / 2);
        const topPt = clientPointToSvgUser(svg, cx, top);
        return { cx: center.x, topY: topPt.y };
      }
    }
  } catch {
    /* ignore */
  }

  const br = note.PositionAndShape?.BoundingRectangle;
  if (br && (br.width > 0 || br.height > 0)) {
    return {
      cx: br.x + br.width / 2,
      topY: br.y,
    };
  }

  const ap = note.PositionAndShape?.AbsolutePosition;
  if (ap) {
    return { cx: ap.x, topY: ap.y };
  }

  return null;
}

export function pickMainScoreSvg(container: HTMLElement): SVGSVGElement | null {
  const svgs = Array.from(container.querySelectorAll('svg')).filter(
    (n): n is SVGSVGElement => n instanceof SVGSVGElement
  );
  if (svgs.length === 0) return null;
  if (svgs.length === 1) return svgs[0];

  let best: SVGSVGElement | null = null;
  let bestArea = 0;
  for (const s of svgs) {
    const vb = s.viewBox.baseVal;
    const w = vb.width > 0 ? vb.width : s.clientWidth || 0;
    const h = vb.height > 0 ? vb.height : s.clientHeight || 0;
    const area = w * h;
    if (area >= bestArea) {
      bestArea = area;
      best = s;
    }
  }
  return best;
}

export function viewBoxString(svg: SVGSVGElement): string {
  const vb = svg.viewBox.baseVal;
  if (vb.width > 0 && vb.height > 0) {
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
  }
  return `0 0 ${svg.clientWidth || 1} ${svg.clientHeight || 1}`;
}

/** OSMD SVG와 동일한 사각형·viewBox로 오버레이를 맞춤 */
export function measureOverlayLayout(
  container: HTMLElement
): { viewBox: string; style: CSSProperties } | null {
  const parent = container.parentElement;
  const svg = pickMainScoreSvg(container);
  if (!parent || !svg) return null;

  const pr = parent.getBoundingClientRect();
  const sr = svg.getBoundingClientRect();

  return {
    viewBox: viewBoxString(svg),
    style: {
      position: 'absolute',
      left: sr.left - pr.left + parent.scrollLeft,
      top: sr.top - pr.top + parent.scrollTop,
      width: sr.width,
      height: sr.height,
      pointerEvents: 'none',
      zIndex: 1,
    },
  };
}
