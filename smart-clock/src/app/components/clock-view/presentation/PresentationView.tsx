import type { Presentation } from '../../store/config/configState';
import { tenantBaseUrl } from '../../store/config/configApi';
import { useAppSelector } from '../../../hooks';
import { getTenantIdSelector } from '../../store/config/configSelectors';
import './PresentationView.scss';

interface Props {
  presentation: Presentation;
}

/**
 * Full-screen presentation display.
 * Renders images as <img>, PDFs via native <embed>.
 */
export const PresentationView = ({ presentation }: Props) => {
  const tenantId = useAppSelector(getTenantIdSelector);
  if (!tenantId) return null;

  // Resolve file URL relative to the tenant's GitHub Pages root
  const fileUrl = presentation.file.startsWith('http')
    ? presentation.file
    : `${tenantBaseUrl(tenantId)}${presentation.file.replace(/^\//, '')}`;

  return (
    <div className="presentation-view">
      <div className="presentation-title-bar">
        <span className="presentation-title">{presentation.title}</span>
      </div>
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
    </div>
  );
};
