import { InfoPanelRotator } from './info/InfoPanelRotator';
import { TimesContainer } from './times/TimesContainer';
import type { TitlesState } from '../store/titles/titlesState';
import type { TimeState } from '../store/times/timesState';
import type { ZmanimCount } from '@shared/core/display/zmanim-count';

interface DashboardBodyProps {
  titles: TitlesState;
  times: TimeState;
  count?: ZmanimCount;
  rowsPerPage?: number;
  infoPaused?: boolean;
}

/**
 * Reusable dashboard body: rotating info panel + zmanim grid.
 * Keeps the container-type declarations so cq units resolve correctly.
 * Used by both tablet ClockView and TV dashboard column.
 */
export const DashboardBody = ({ titles, times, count, rowsPerPage, infoPaused }: DashboardBodyProps) => (
  <>
    {/* Info Panel: rotating pages of prayer/study info */}
    <section className="info-section">
      <InfoPanelRotator titles={titles} rowsPerPage={rowsPerPage ?? 2} paused={infoPaused} />
    </section>

    {/* Zmanim */}
    <section className="zmanim-section">
      <TimesContainer times={times} count={count} />
    </section>
  </>
);
