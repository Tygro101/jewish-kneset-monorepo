import { useState, useEffect, useRef } from 'react';
import type { InfoPage } from './infoPages';
import { pagesSignature } from './infoPages';
import { readCursor, advanceCursor } from './infoRotationCursor';

export const INFO_PAGE_SECONDS = 12;
export const FADE_MS = 350;

interface UseInfoRotationOptions {
  paused?: boolean;
}

interface UseInfoRotationResult {
  page: InfoPage | null;
  index: number;
  fading: boolean;
}

/**
 * Drives the info panel rotation timer.
 * - Reads the persistent cursor on mount so the panel resumes where it left off.
 * - Does not advance while `paused` is true.
 * - Sets `fading` 350ms before the page swap for a crossfade effect.
 */
export function useInfoRotation(
  pages: InfoPage[],
  options: UseInfoRotationOptions = {},
): UseInfoRotationResult {
  const { paused = false } = options;
  const signature = pagesSignature(pages);
  const [index, setIndex] = useState(() => readCursor(signature, pages.length));
  const [fading, setFading] = useState(false);

  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const signatureRef = useRef(signature);
  signatureRef.current = signature;

  // Sync index when signature changes (day rolled over)
  useEffect(() => {
    setIndex(readCursor(signature, pages.length));
    setFading(false);
  }, [signature, pages.length]);

  useEffect(() => {
    if (paused || pages.length <= 1) return;

    const holdMs = INFO_PAGE_SECONDS * 1000;

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(holdMs - FADE_MS, 0));

    const swapTimer = setTimeout(() => {
      const newIndex = advanceCursor(signatureRef.current, pagesRef.current.length);
      setIndex(newIndex);
      setFading(false);
    }, holdMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(swapTimer);
    };
  }, [index, paused, pages.length, signature]);

  const safeIndex = pages.length === 0 ? 0 : Math.min(index, pages.length - 1);
  const page = pages[safeIndex] ?? null;

  return { page, index: safeIndex, fading };
}
