import { useEffect, useState } from 'react';
import { mediaUrl } from '../api';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
  className?: string;
  intervalMs?: number;
};

export default function MediaStage({ items, className = '', intervalMs = 8000 }: Props) {
  const [i, setI] = useState(0);
  const current = items[i];

  useEffect(() => {
    setI(0);
  }, [items]);

  useEffect(() => {
    if (items.length < 2) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), intervalMs);
    return () => window.clearInterval(t);
  }, [items, current, intervalMs]);

  if (!current) return null;

  function next() {
    setI((n) => (n + 1) % items.length);
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
          loop={items.length === 1}
          onEnded={items.length > 1 ? next : undefined}
        />
      ) : (
        <img key={current._id} src={mediaUrl(current.url)} alt="" />
      )}
    </div>
  );
}
