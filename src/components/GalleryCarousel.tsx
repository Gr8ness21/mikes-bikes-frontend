import { useCallback, useEffect, useState } from 'react';
import { mediaUrl } from '../api';
import type { GalleryItem } from '../types';

type Props = {
  items: GalleryItem[];
  leadOnce?: GalleryItem;
};

export default function GalleryCarousel({ items, leadOnce }: Props) {
  const [i, setI] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [leadDone, setLeadDone] = useState(!leadOnce);
  const showingLead = Boolean(leadOnce && !leadDone);
  const current = showingLead ? leadOnce : items[i];
  const photoIndexes = items.flatMap((item, idx) => (item.kind === 'image' ? [idx] : []));

  useEffect(() => {
    setI(0);
    setLeadDone(!leadOnce);
  }, [items, leadOnce]);

  useEffect(() => {
    if (showingLead || lightbox) return;
    if (items.length < 2) return;
    if (current?.kind === 'video') return;
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), 7000);
    return () => window.clearInterval(t);
  }, [items, current, lightbox, showingLead]);

  function finishLead() {
    setLeadDone(true);
    setI(0);
  }

  function go(delta: number) {
    if (showingLead) {
      finishLead();
      return;
    }
    if (!items.length) return;
    setI((n) => (n + delta + items.length) % items.length);
  }

  const goPhoto = useCallback(
    (delta: number) => {
      const indexes = items.flatMap((item, idx) => (item.kind === 'image' ? [idx] : []));
      if (indexes.length < 2) return;
      setI((n) => {
        const pos = indexes.indexOf(n);
        const from = pos >= 0 ? pos : 0;
        return indexes[(from + delta + indexes.length) % indexes.length];
      });
    },
    [items]
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') goPhoto(-1);
      if (e.key === 'ArrowRight') goPhoto(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, goPhoto]);

  if (!current) return null;

  const caption = current.alt || current.originalName;
  const showLightboxNav = lightbox && current.kind === 'image' && photoIndexes.length > 1;

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
              loop={!showingLead && items.length === 1}
              onEnded={showingLead || items.length > 1 ? () => go(1) : undefined}
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
          {showLightboxNav && (
            <button
              type="button"
              className="lightbox-nav lightbox-nav-prev"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                goPhoto(-1);
              }}
            >
              ‹
            </button>
          )}
          <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={mediaUrl(current.url)} alt={caption} />
            <figcaption>{caption}</figcaption>
            <button type="button" className="btn btn-ghost" onClick={() => setLightbox(false)}>
              Close
            </button>
          </figure>
          {showLightboxNav && (
            <button
              type="button"
              className="lightbox-nav lightbox-nav-next"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                goPhoto(1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
