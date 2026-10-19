import { useEffect, useState } from 'react';
import { mediaUrl } from '../api';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
  leadOnce?: GalleryItem;
  className?: string;
  intervalMs?: number;
  onActiveChange?: (hasMedia: boolean) => void;
};

export default function MediaStage({
  items,
  leadOnce,
  className = '',
  intervalMs = 8000,
  onActiveChange,
}: Props) {
  const [i, setI] = useState(0);
  const [skip, setSkip] = useState<Record<string, true>>({});
  const [leadDone, setLeadDone] = useState(!leadOnce);
  const playable = items.filter((item) => !skip[item._id]);
  const showingLead = Boolean(leadOnce && !leadDone && !skip[leadOnce._id]);
  const current = showingLead ? leadOnce : playable[i] || playable[0];

  useEffect(() => {
    setI(0);
    setLeadDone(!leadOnce);
  }, [items, leadOnce]);

  useEffect(() => {
    onActiveChange?.(Boolean(current));
  }, [current, onActiveChange]);

  useEffect(() => {
    if (showingLead) return;
    if (playable.length < 2) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % playable.length), intervalMs);
    return () => window.clearInterval(t);
  }, [playable, current, intervalMs, showingLead]);

  if (!current) return null;

  function fail() {
    if (showingLead && leadOnce) {
      setSkip((prev) => ({ ...prev, [leadOnce._id]: true }));
      setLeadDone(true);
      return;
    }
    if (!current) return;
    setSkip((prev) => ({ ...prev, [current._id]: true }));
    setI(0);
  }

  function next() {
    if (showingLead) {
      setLeadDone(true);
      setI(0);
      return;
    }
    if (!playable.length) return;
    setI((n) => (n + 1) % playable.length);
  }

  return (
    <div className={`media-stage ${className}`.trim()} aria-hidden>
      {current.kind === 'video' ? (
        <video
          key={current._id}
          src={mediaUrl(current.url)}
          autoPlay
          muted
          playsInline
          loop={!showingLead && playable.length === 1}
          onError={fail}
          onEnded={showingLead || playable.length > 1 ? next : undefined}
        />
      ) : (
        <img key={current._id} src={mediaUrl(current.url)} alt="" onError={fail} />
      )}
    </div>
  );
}
