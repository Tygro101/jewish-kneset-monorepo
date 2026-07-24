import { useEffect } from 'react';
import { isOverflowing, nextShrinkScale } from '../shared/fitScale';

export interface FitToScreenOptions {
  floor?: number;       // smallest allowed scale
  ceil?: number;        // largest allowed scale (the default bump)
  step?: number;        // shrink increment per pass
  cssVar?: string;      // CSS variable to drive (default --ui-scale)
  selector?: string;    // measured overflow-prone elements
}

/**
 * On mount, on content change (deps), and on resize:
 * reset --ui-scale to `ceil`, then shrink step-by-step (never below `floor`)
 * until no measured element overflows vertically and the root does not
 * overflow horizontally. Shrink-only => stable, no flicker/oscillation.
 * Suitable for a non-interactive kiosk display (no scrolling).
 */
export function useFitToScreen(
  rootRef: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  options: FitToScreenOptions = {}
) {
  const {
    floor = 0.75,
    ceil = 1.2,
    step = 0.02,
    cssVar = '--ui-scale',
    selector = '[data-fit-measure]',
  } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let canceled = false;

    const hasOverflow = (): boolean => {
      // horizontal overflow of the whole app (e.g. very wide clock on narrow screens)
      if (isOverflowing(root.scrollWidth, root.clientWidth)) return true;
      // vertical overflow of any measured section
      const nodes = root.querySelectorAll<HTMLElement>(selector);
      for (const el of Array.from(nodes)) {
        if (isOverflowing(el.scrollHeight, el.clientHeight)) return true;
      }
      return false;
    };

    const converge = () => {
      if (canceled) return;
      const current =
        parseFloat(getComputedStyle(root).getPropertyValue(cssVar)) || ceil;
      const next = nextShrinkScale({ overflow: hasOverflow(), currentScale: current, floor, step });
      if (next !== current) {
        root.style.setProperty(cssVar, String(next));
        raf = requestAnimationFrame(converge); // keep shrinking until it fits
      }
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      root.style.setProperty(cssVar, String(ceil)); // always start from full bump
      raf = requestAnimationFrame(converge);
    };

    restart();

    const ro = new ResizeObserver(restart);
    ro.observe(root);

    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
