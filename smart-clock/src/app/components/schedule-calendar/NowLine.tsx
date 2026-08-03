interface NowLineProps {
  topPct: number;
}

/** Horizontal "now" indicator drawn at a % offset inside the day column track. */
export const NowLine = ({ topPct }: NowLineProps) => (
  <div className="cal-now" style={{ top: `${topPct}%` }}>
    <span className="cal-now-dot" />
    <span className="cal-now-line" />
  </div>
);
