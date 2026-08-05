import { useState, useEffect } from 'react';
import { now } from '../../debug/clock';

/** Returns minutes from midnight, updated every 30 seconds. Re-syncs on visibility restore. */
export function useNowMinutes(): number {
  const [nowMin, setNowMin] = useState(() => minutesFromMidnight());

  useEffect(() => {
    const update = () => setNowMin(minutesFromMidnight());

    const id = setInterval(update, 30_000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return nowMin;
}

function minutesFromMidnight(): number {
  const n = now();
  return n.getHours() * 60 + n.getMinutes();
}
