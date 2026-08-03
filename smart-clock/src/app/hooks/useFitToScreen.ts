import { useEffect } from 'react';
import { isOverflowing, nextShrinkScale } from '../shared/fitScale';

export interface FitToScreenOptions {
  floor?: number;       // smallest allowed scale
  ceil?: number;        // largest allowed scale (the default bump)
  step?: number;        // shrink increment per pass
  cssVar?: string;      // CSS variable to drive (default --fit-scale)
  selector?: string;    // measured overflow-prone elements
}

/**
 * On mount, on content change (deps), and on resize:
 * reset --fit-scale to `ceil`, then shrink step-by-step (never below `floor`)
 * until no measured element overflows vertically and the root does not
 * overflow horizontally. Shrink-only => stable, no flicker/oscillation.
 * Suitable for a non-interactive kiosk display (no scrolling).
 *
 * Overflow detection uses both scrollHeight/clientHeight AND bounding-rect
 * comparison (child rect vs parent rect), because CSS size containment
 * (container-type: size) silences scrollHeight reporting while allowing
 * children to visually bleed past their parent's bounds.
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
    cssVar = '--fit-scale',
    selector = '[data-fit-measure]',
  } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let canceled = false;

    const hasOverflow = (): boolean => {
      // horizontal overflow of the whole app
      if (isOverflowing(root.scrollWidth, root.clientWidth)) return true;

      const nodes = root.querySelectorAll<HTMLElement>(selector);
      for (const el of Array.from(nodes)) {
        // Classic check: scrollHeight vs clientHeight
        if (isOverflowing(el.scrollHeight, el.clientHeight)) return true;

        // Bounding-rect check: detects children bleeding past a size-contained parent.
        // If any direct child's bottom edge extends past the element's bottom edge,
        // content is overflowing visually even if scrollHeight doesn't report it.
        const parentRect = el.getBoundingClientRect();
        for (const child of Array.from(el.children) as HTMLElement[]) {
          const childRect = child.getBoundingClientRect();
          if (childRect.bottom > parentRect.bottom + 1) return true;
          if (childRect.right > parentRect.right + 1) return true;
        }
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
