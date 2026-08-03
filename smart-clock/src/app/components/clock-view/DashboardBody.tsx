import { TitlesContainer } from './titles/TitlesView';
import { TimesContainer } from './times/TimesContainer';
import type { TitlesState } from '../store/titles/titlesState';
import type { TimeState } from '../store/times/timesState';

interface DashboardBodyProps {
  titles: TitlesState;
  times: TimeState;
}

/**
 * Reusable dashboard body: info cards (תפילה / לימוד יומי) + zmanim grid.
 * Keeps the container-type declarations so cq units resolve correctly.
 * Used by both tablet ClockView and TV dashboard column.
 */
export const DashboardBody = ({ titles, times }: DashboardBodyProps) => (
  <>
    {/* Info Cards: תפילה / לימוד יומי */}
    <section className="info-section">
      <TitlesContainer titles={titles} />
    </section>

    {/* Zmanim */}
    <section className="zmanim-section">
      <div className="zmanim-header">
        <span className="zmanim-title">זמני היום</span>
      </div>
      <TimesContainer times={times} />
    </section>
  </>
);
