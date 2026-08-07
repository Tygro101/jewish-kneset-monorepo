import type { Presentation } from '../../store/config/configState';
import { tenantBaseUrl } from '../../store/config/configApi';
import { useAppSelector } from '../../../hooks';
import { getTenantIdSelector } from '../../store/config/configSelectors';
import { sanitizePresentationPath } from './presentationPath';
import './PresentationView.scss';

// Re-exported for backwards compatibility — the implementation now lives in
// presentationPath.ts so non-React modules can use it.
export { sanitizePresentationPath };

interface Props {
  presentation: Presentation;
}

/**
 * Full-screen presentation display.
 * Renders images as <img>, PDFs via native <embed>.
 * Only renders files from the tenant's `presentations/` directory with allowed extensions.
 */
export const PresentationView = ({ presentation }: Props) => {
  const tenantId = useAppSelector(getTenantIdSelector);
  if (!tenantId) return null;

  const sanitizedPath = sanitizePresentationPath(presentation.file);
  if (!sanitizedPath) return null;

  const fileUrl = `${tenantBaseUrl(tenantId)}${sanitizedPath}`;
  const title = presentation.title?.trim();

  return (
    <div className="presentation-view">
      <div className="presentation-content">
        {presentation.type === 'image' ? (
          <img
            src={fileUrl}
            alt={presentation.title}
            className="presentation-image"
          />
        ) : (
          <embed
            src={fileUrl}
            type="application/pdf"
            className="presentation-pdf"
            title={presentation.title}
          />
        )}
      </div>
      {title && (
        <div className="presentation-title-bar">
          <span className="presentation-title">{title}</span>
        </div>
      )}
    </div>
  );
};
