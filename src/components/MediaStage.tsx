import { useEffect, useState } from 'react';
import { mediaUrl } from '../api';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
  className?: string;
  intervalMs?: number;
  onActiveChange?: (hasMedia: boolean) => void;
};

export default function MediaStage({ items, className = '', intervalMs = 8000, onActiveChange }: Props) {
  const [i, setI] = useState(0);
  const [skip, setSkip] = useState<Record<string, true>>({});
  const playable = items.filter((item) => !skip[item._id]);
  const current = playable[i] || playable[0];

  useEffect(() => {
    setI(0);
  }, [items]);

  useEffect(() => {
    onActiveChange?.(playable.length > 0);
  }, [playable.length, onActiveChange]);

  useEffect(() => {
    if (playable.length < 2) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % playable.length), intervalMs);
    return () => window.clearInterval(t);
  }, [playable, current, intervalMs]);

  if (!current) return null;

  function fail() {
    setSkip((prev) => ({ ...prev, [current._id]: true }));
    setI(0);
  }

  function next() {
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
          loop={playable.length === 1}
          onError={fail}
          onEnded={playable.length > 1 ? next : undefined}
        />
      ) : (
        <img key={current._id} src={mediaUrl(current.url)} alt="" onError={fail} />
      )}
    </div>
  );
}
