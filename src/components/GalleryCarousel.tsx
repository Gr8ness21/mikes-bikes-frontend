import { useEffect, useState } from 'react';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
};

export default function GalleryCarousel({ items }: Props) {
  const [i, setI] = useState(0);
  const current = items[i];

  useEffect(() => {
    setI(0);
  }, [items]);

  useEffect(() => {
    if (items.length < 2) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), 7000);
    return () => window.clearInterval(t);
  }, [items, current]);

  if (!current) return null;

  function go(delta: number) {
    setI((n) => (n + delta + items.length) % items.length);
  }

  return (
    <section className="gallery-parallax" aria-label="Customer photos and videos">
      <div className="gallery-parallax-media">
        {current.kind === 'video' ? (
          <video
            key={current._id}
            src={current.url}
            autoPlay
            muted
            playsInline
            controls={false}
            loop={items.length === 1}
            onEnded={items.length > 1 ? () => go(1) : undefined}
          />
        ) : (
          <div
            key={current._id}
            className="gallery-parallax-still"
            style={{ backgroundImage: `url(${current.url})` }}
          />
        )}
      </div>
      <div className="gallery-parallax-scrim" />
      <div className="gallery-parallax-bar">
        <p className="kicker">On the road</p>
        {items.length > 1 && (
          <div className="faq-controls">
            <button type="button" className="btn btn-ghost" onClick={() => go(-1)}>
              Previous
            </button>
            <div className="faq-dots" role="tablist" aria-label="Gallery slides">
              {items.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  className={idx === i ? 'is-active' : ''}
                  onClick={() => setI(idx)}
                >
                  <span className="sr-only">{item.alt || item.originalName}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => go(1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
