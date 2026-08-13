import type { InfoPage } from './infoPages';
import './InfoPanel.scss';

interface InfoPanelProps {
  page: InfoPage;
  fading?: boolean;
}

/**
 * Presentational: renders one page of the info rotation.
 * Prayer rows show only the value. Study rows show label + value.
 */
export const InfoPanel = ({ page, fading }: InfoPanelProps) => (
  <div className={`info-panel ${fading ? 'is-fading' : ''}`}>
    <div className="info-panel-rows">
      {page.rows.map((row, i) => (
        <div key={`${row.value}-${i}`} className="info-panel-row">
          {row.label && <span className="info-panel-label">{row.label}</span>}
          <span className="info-panel-value">{row.value}</span>
        </div>
      ))}
    </div>
  </div>
);
