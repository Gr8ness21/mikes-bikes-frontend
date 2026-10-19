import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';
import HelpTip from './HelpTip';
import type { GalleryItem } from '../types';

type Props = {
  onMessage: (text: string) => void;
  onError: (text: string) => void;
};

export default function GalleryAdmin({ onMessage, onError }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [showOnHome, setShowOnHome] = useState(true);
  const [showOnAbout, setShowOnAbout] = useState(true);
  const [alt, setAlt] = useState('');
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api<{ items: GalleryItem[] }>('/api/admin/gallery');
    setItems(data.items);
    setCaptions(Object.fromEntries(data.items.map((item) => [item._id, item.alt || ''])));
  }

  useEffect(() => {
    load().catch((e) => onError(e.message));
  }, [onError]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!files?.length) {
      onError('Choose photos or videos first.');
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      Array.from(files).forEach((file) => body.append('files', file));
      body.append('showOnHome', String(showOnHome));
      body.append('showOnAbout', String(showOnAbout));
      if (alt) body.append('alt', alt);
      await api('/api/admin/gallery', { method: 'POST', body });
      setFiles(null);
      setAlt('');
      (e.target as HTMLFormElement).reset();
      setShowOnHome(true);
      setShowOnAbout(true);
      onMessage('Media uploaded');
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  async function saveOrder(next: GalleryItem[]) {
    setItems(next);
    await api('/api/admin/gallery/order', {
      method: 'PUT',
      body: JSON.stringify({ ids: next.map((item) => item._id) }),
    });
  }

  function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    saveOrder(next).catch((e) => onError(e.message));
  }

  async function patch(id: string, fields: Partial<GalleryItem>) {
    await api(`/api/admin/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
    await load();
  }

  async function remove(id: string) {
    await api(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <h2>
        Customer gallery
        <HelpTip label="Customer gallery">
          The first five slots are Top 5. Photos and videos there are stored in the database so they
          survive a Render redeploy. Use Up/Down to move keepers into those slots. Edit a caption
          anytime and save it. Home = hero. About = On the road carousel.
        </HelpTip>
      </h2>
      <p className="muted">
        The first five rows are Top 5 and are saved in the database, including videos. Home uses
        checked items as the hero background. About uses checked items in the parallax carousel.
      </p>
      <form className="form" onSubmit={upload} style={{ marginTop: '1rem' }}>
        <label>
          Photos / videos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
        </label>
        <label>
          Caption (optional)
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Customer haul" />
        </label>
        <div className="inline-fields">
          <label className="check-row">
            <input type="checkbox" checked={showOnHome} onChange={(e) => setShowOnHome(e.target.checked)} />
            Show on Home
          </label>
          <label className="check-row">
            <input type="checkbox" checked={showOnAbout} onChange={(e) => setShowOnAbout(e.target.checked)} />
            Show on About carousel
          </label>
        </div>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {items.length === 0 && <p className="muted">No customer media yet — business card art stays as fallback.</p>}
      <ul className="gallery-admin-list">
        {items.map((item, index) => (
          <li key={item._id} className={`gallery-admin-row${index < 5 ? ' is-top5' : ''}`}>
            {item.kind === 'video' ? (
              <video src={mediaUrl(item.url)} muted playsInline />
            ) : (
              <img src={mediaUrl(item.url)} alt={item.alt || item.originalName} />
            )}
            <div>
              <strong>{item.originalName}</strong>
              {index < 5 && <span className="top5-badge">Top 5</span>}
              <p className="muted">
                {item.kind}
                {item.durable ? ' · saved in database' : ''}
              </p>
              <label>
                Caption
                <input
                  value={captions[item._id] ?? item.alt ?? ''}
                  onChange={(e) => setCaptions((current) => ({ ...current, [item._id]: e.target.value }))}
                  placeholder="Shown when the photo is enlarged"
                />
              </label>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: '0.4rem' }}
                onClick={() =>
                  patch(item._id, { alt: captions[item._id] ?? '' })
                    .then(() => onMessage('Caption saved'))
                    .catch((err) => onError(err instanceof Error ? err.message : 'Could not save caption'))
                }
              >
                Save caption
              </button>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={item.showOnHome}
                  onChange={(e) => patch(item._id, { showOnHome: e.target.checked })}
                />
                Home
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={item.showOnAbout}
                  onChange={(e) => patch(item._id, { showOnAbout: e.target.checked })}
                />
                About
              </label>
            </div>
            <div className="gallery-admin-actions">
              <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => move(index, -1)}>
                Up
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                Down
              </button>
              <button type="button" className="linkish" onClick={() => remove(item._id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
