/**
 * Colour-contrast utilities for WCAG 2.1 compliance checking.
 * Used by the theme audit spec to enforce legibility floors.
 */

export interface RGBA { r: number; g: number; b: number; a: number }

/**
 * Parse a CSS colour string into RGBA components (0-255 for rgb, 0-1 for a).
 * Supports: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba().
 * Throws on unparseable input.
 */
export function parseColor(input: string): RGBA {
  const s = input.trim();

  // #rgb or #rrggbb or #rrggbbaa
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error(`Invalid hex color: ${input}`);
    }
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
    throw new Error(`Invalid hex color: ${input}`);
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (rgbMatch) {
    return {
      r: Math.round(Number(rgbMatch[1])),
      g: Math.round(Number(rgbMatch[2])),
      b: Math.round(Number(rgbMatch[3])),
      a: rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    };
  }

  throw new Error(`Unparseable color: ${input}`);
}

/**
 * Blend a foreground colour (potentially transparent) over an opaque backdrop.
 * Uses standard alpha compositing (source-over). Returns an opaque RGBA.
 */
export function blendOver(fg: string | RGBA, backdrop: string | RGBA): RGBA {
  const f = typeof fg === 'string' ? parseColor(fg) : fg;
  const b = typeof backdrop === 'string' ? parseColor(backdrop) : backdrop;
  const a = f.a;
  return {
    r: Math.round(f.r * a + b.r * (1 - a)),
    g: Math.round(f.g * a + b.g * (1 - a)),
    b: Math.round(f.b * a + b.b * (1 - a)),
    a: 1,
  };
}

/**
 * Relative luminance per WCAG 2.1 (0 = darkest black, 1 = lightest white).
 * Input: opaque colour (alpha ignored).
 */
export function relativeLuminance(color: string | RGBA): number {
  const c = typeof color === 'string' ? parseColor(color) : color;
  const [rs, gs, bs] = [c.r / 255, c.g / 255, c.b / 255].map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG contrast ratio between two colours (1:1 to 21:1).
 * Both inputs should be opaque; if they carry alpha, blend over black first.
 */
export function contrastRatio(a: string | RGBA, b: string | RGBA): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [l1, l2] = la > lb ? [la, lb] : [lb, la];
  return (l1 + 0.05) / (l2 + 0.05);
}
