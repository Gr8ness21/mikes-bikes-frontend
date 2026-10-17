import { useEffect, useState } from 'react';
import { mediaUrl } from '../api';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
};

export default function GalleryCarousel({ items }: Props) {
  const [i, setI] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = items[i];

  useEffect(() => {
    setI(0);
  }, [items]);

  useEffect(() => {
    if (items.length < 2 || lightbox) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), 7000);
    return () => window.clearInterval(t);
  }, [items, current, lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (!current) return null;

  function go(delta: number) {
    setI((n) => (n + delta + items.length) % items.length);
  }

  const caption = current.alt || current.originalName;

  return (
    <>
    <section
      className={`gallery-parallax${current.kind === 'image' ? ' is-zoomable' : ''}`}
      aria-label="Customer photos and videos"
      onClick={(e) => {
        if (current.kind !== 'image') return;
        if ((e.target as HTMLElement).closest('.gallery-parallax-bar')) return;
        setLightbox(true);
      }}
    >
      <div className="gallery-parallax-media">
        {current.kind === 'video' ? (
          <video
            key={current._id}
            src={mediaUrl(current.url)}
            autoPlay
            muted
            playsInline
            controls={false}
            loop={items.length === 1}
            onEnded={items.length > 1 ? () => go(1) : undefined}
            onError={() => go(1)}
          />
        ) : (
          <div
            key={current._id}
            className="gallery-parallax-still"
            style={{ backgroundImage: `url(${mediaUrl(current.url)})` }}
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
    {lightbox && current.kind === 'image' && (
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={caption}
        onClick={() => setLightbox(false)}
      >
        <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
          <img src={mediaUrl(current.url)} alt={caption} />
          <figcaption>{caption}</figcaption>
          <button type="button" className="btn btn-ghost" onClick={() => setLightbox(false)}>
            Close
          </button>
        </figure>
      </div>
    )}
    </>
  );
}
