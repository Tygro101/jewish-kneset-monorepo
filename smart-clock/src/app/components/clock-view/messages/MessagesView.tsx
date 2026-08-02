import { useState, useEffect } from 'react';
import type { DisplayMessage, MessageType } from '../../store/config/configState';
import { resolveDurationMs } from '../presentation/useDisplayRotation';
import './MessagesView.scss';

const FADE_MS = 350;

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  donor: 'הוקרת תורם',
  announcement: 'הודעה',
  memorial: 'לזכר',
  mazaltov: 'מזל טוב',
};

export const MESSAGE_TYPE_COLORS: Record<MessageType, string> = {
  donor: '#34d399',
  announcement: '#60a5fa',
  memorial: '#94a3b8',
  mazaltov: '#fb923c',
};

const FALLBACK_COLOR = '#34d399';

interface Props {
  messages: DisplayMessage[];
  defaultSeconds: number;
}

export const MessagesView = ({ messages, defaultSeconds }: Props) => {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const safeIndex = messages.length === 0 ? 0 : Math.min(index, messages.length - 1);
  const current = messages[safeIndex];

  useEffect(() => {
    if (messages.length <= 1) return;
    const holdMs = resolveDurationMs(current?.durationSeconds, defaultSeconds);

    const fadeTimer = setTimeout(() => setFading(true), Math.max(holdMs - FADE_MS, 0));
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % messages.length);
      setFading(false);
    }, holdMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(swapTimer);
    };
  }, [safeIndex, messages, current, defaultSeconds]);

  if (!current) return null;

  const accent = MESSAGE_TYPE_COLORS[current.type] ?? FALLBACK_COLOR;
  const label = MESSAGE_TYPE_LABELS[current.type] ?? MESSAGE_TYPE_LABELS.announcement;
  const names = current.title.split('\n').map((n) => n.trim()).filter(Boolean);

  return (
    <div className="messages-view">
      <div
        className={`messages-slide ${fading ? 'is-fading' : ''}`}
        style={{ '--accent': accent } as React.CSSProperties}
      >
        <div className="messages-stripe messages-stripe-top" />
        <div className="messages-glow" aria-hidden="true" />

        <div className="messages-body">
          <div className="messages-badge">
            <span className="messages-badge-dot" />
            <span className="messages-badge-label">{label}</span>
          </div>

          <div className="messages-names">
            {names.map((name, i) => (
              <div
                key={i}
                className={`messages-name ${names.length > 1 ? 'is-multi' : ''}`}
              >
                {name}
              </div>
            ))}
          </div>

          <div className="messages-divider" />

          {current.body && <div className="messages-text">{current.body}</div>}
        </div>

        <div className="messages-stripe messages-stripe-bottom" />
      </div>

      {messages.length > 1 && (
        <>
          <div className="messages-dots" aria-hidden="true">
            {messages.map((_, i) => (
              <span key={i} className={`messages-dot ${i === safeIndex ? 'is-active' : ''}`} />
            ))}
          </div>
          <div className="messages-counter">
            {safeIndex + 1} / {messages.length}
          </div>
        </>
      )}
    </div>
  );
};
