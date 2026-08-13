import { useMemo } from 'react';
import type { IClockTitle } from '@shared/core/services/workers/handlers/models/shared-models';
import type { TypedObjectMap } from '@shared/models/core';
import { buildInfoPages } from './infoPages';
import { useInfoRotation } from './useInfoRotation';
import { InfoPanel } from './InfoPanel';

interface InfoPanelRotatorProps {
  titles: TypedObjectMap<IClockTitle>;
  rowsPerPage: number;
  paused?: boolean;
}

/**
 * Builds info pages from titles and rotates them on a timer.
 * The `paused` flag suspends the rotation (used when the dashboard is hidden
 * behind a presentation overlay).
 */
export const InfoPanelRotator = ({ titles, rowsPerPage, paused }: InfoPanelRotatorProps) => {
  const pages = useMemo(
    () => buildInfoPages(titles, { rowsPerPage }),
    [titles, rowsPerPage],
  );

  const { page, fading } = useInfoRotation(pages, { paused });

  if (!page) return null;

  return (
    <div className="info-panel-container" data-fit-measure>
      <InfoPanel page={page} fading={fading} />
    </div>
  );
};
