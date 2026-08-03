interface TimePillProps {
  time: string;
  faded?: boolean;
}

/** Start/end time badge inside an event block. */
export const TimePill = ({ time, faded }: TimePillProps) => (
  <span className={`cal-pill ${faded ? 'cal-pill--faded' : ''}`}>{time}</span>
);
