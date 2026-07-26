import type { Presentation } from '../../store/config/configState';
import { tenantBaseUrl } from '../../store/config/configApi';
import { useAppSelector } from '../../../hooks';
import { getTenantIdSelector } from '../../store/config/configSelectors';
import './PresentationView.scss';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Sanitizes a presentation file path to ensure it is a safe, tenant-relative path.
 *
 * - Rejects any path containing a scheme (`://`) or starting with `//`.
 * - Rejects paths containing `..` (path traversal).
 * - Strips leading `/` and ensures the path starts with `presentations/`.
 * - Only allows extensions: .pdf, .jpg, .jpeg, .png, .gif, .webp.
 * - Returns the sanitized relative path or `null` if invalid.
 */
export function sanitizePresentationPath(filePath: string): string | null {
  if (!filePath || typeof filePath !== 'string') return null;

  // Reject any scheme (e.g., http://, ftp://, data://)
  if (filePath.includes('://')) return null;

  // Reject protocol-relative URLs
  if (filePath.startsWith('//')) return null;

  // Reject path traversal
  if (filePath.includes('..')) return null;

  // Strip leading slashes
  let sanitized = filePath.replace(/^\/+/, '');

  // Ensure path starts with presentations/
  if (!sanitized.startsWith('presentations/')) {
    return null;
  }

  // Validate allowed file extension
  const lowerPath = sanitized.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    lowerPath.endsWith(ext)
  );
  if (!hasAllowedExtension) return null;

  return sanitized;
}

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
