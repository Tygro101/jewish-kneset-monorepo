const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Sanitizes a presentation file path to ensure it is a safe, tenant-relative path.
 *
 * - Rejects any path containing a scheme (`://`) or starting with `//`.
 * - Rejects paths containing `..` (path traversal).
 * - Strips leading `/` and ensures the path starts with `presentations/`.
 * - Only allows extensions: .pdf, .jpg, .jpeg, .png, .gif, .webp.
 * - Returns the sanitized relative path or `null` if invalid.
 *
 * Lives in its own module (rather than in PresentationView.tsx) so non-React
 * code — e.g. the media cache pruner — can import it without pulling in React.
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
  const sanitized = filePath.replace(/^\/+/, '');

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
