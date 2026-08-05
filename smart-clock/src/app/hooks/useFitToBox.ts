import { useEffect } from 'react';
import { isOverflowing, nextShrinkScale } from '../shared/fitScale';

export interface FitToBoxOptions {
  floor?: number;   // smallest allowed multiplier
  ceil?: number;    // starting multiplier, reset on every deps change
  step?: number;
  cssVar?: string;
}

/**
 * Shrink-only fit guard scoped to ONE box.
 *
 * Unlike `useFitToScreen`, which drives the app-wide `--fit-scale`, this writes
 * only on `boxRef`. An overlong message must never shrink the clock rendered
 * beside it.
 *
 * The box is sized by its grid parent, so changing the font size inside it
 * cannot change the box's own size — convergence is monotonic.
 */
export function useFitToBox(
  boxRef: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  options: FitToBoxOptions = {},
) {
  const { floor = 0.55, ceil = 1, step = 0.04, cssVar = '--msg-fit' } = options;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let raf = 0;
    let canceled = false;

    const hasOverflow = (): boolean => {
      if (isOverflowing(box.scrollHeight, box.clientHeight)) return true;
      // Size containment silences scrollHeight, so compare rects too.
      const boxRect = box.getBoundingClientRect();
      for (const child of Array.from(box.children) as HTMLElement[]) {
        const r = child.getBoundingClientRect();
        if (r.bottom > boxRect.bottom + 1) return true;
        if (r.right > boxRect.right + 1) return true;
      }
      return false;
    };

    const converge = () => {
      if (canceled) return;
      const current = parseFloat(getComputedStyle(box).getPropertyValue(cssVar)) || ceil;
      const next = nextShrinkScale({ overflow: hasOverflow(), currentScale: current, floor, step });
      if (next !== current) {
        box.style.setProperty(cssVar, String(next));
        raf = requestAnimationFrame(converge);
      }
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      box.style.setProperty(cssVar, String(ceil));
      raf = requestAnimationFrame(converge);
    };

    restart();
    const ro = new ResizeObserver(restart);
    ro.observe(box);

    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
