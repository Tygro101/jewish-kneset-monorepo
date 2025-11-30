import { useEffect } from 'react';


export type IAutoScrollProps = {
  containerRef?: React.RefObject<HTMLElement> | null,
  deps: any[],
  options: { downDuration?: number; upDuration?: number; pauseMs?: number, startPauseMs?: number }
}
export function useAutoScrollOnOverflow(props: IAutoScrollProps = {options : {}, deps: []}) {
  const { downDuration = 5000, upDuration = 5000, pauseMs = 10000, startPauseMs = 3000 } = props.options;

  useEffect(() => {
    const el = props.containerRef?.current;
    if (!el) return;
    let canceled = false;

    const hasOverflow = () => el.scrollHeight > el.clientHeight + 1;

    const scrollTo = (pos: number, duration = 600) =>
      new Promise<void>((resolve) => {
        const start = el.scrollTop;
        const delta = pos - start;
        const begin = performance.now();
        const step = (now: number) => {
          if (canceled) return resolve();
          const t = Math.min(1, (now - begin) / duration);
          const eased = 0.5 - Math.cos(Math.PI * t) / 2;
          el.scrollTop = start + delta * eased;
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    let id: any = null;
    const loop = async () => {
      if (!hasOverflow() || canceled) return;
      await new Promise((r) => setTimeout(r, startPauseMs));
      const max = el.scrollHeight - el.clientHeight;
      await scrollTo(max, downDuration);
      if (canceled) return;
      await new Promise((r) => setTimeout(r, pauseMs));
      await scrollTo(0, upDuration);
      if (canceled) return;
      await new Promise((r) => setTimeout(r, pauseMs));
      if (!canceled) id = setTimeout(loop, 100);
    };

    loop();

    return () => {
      canceled = true;
      if (id) clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, props.deps);
}
