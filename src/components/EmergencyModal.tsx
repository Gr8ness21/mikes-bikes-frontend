import { useEffect, useState } from 'react';
import EmergencyForm from './EmergencyForm';

export default function EmergencyModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const fade = window.setTimeout(() => setFading(true), 1600);
    const close = window.setTimeout(() => {
      setOpen(false);
      setSent(false);
      setFading(false);
    }, 2400);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(close);
    };
  }, [sent]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="btn btn-emergency" onClick={() => setOpen(true)}>
        Emergency pickup
      </button>
      {open && (
        <div
          className={`modal-backdrop ${fading ? 'is-fading' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
        >
          <div className="card modal modal-wide">
            {sent ? (
              <p className="success" role="status">
                Request sent. We'll Come Get You!
              </p>
            ) : (
              <>
                <p className="kicker">Need a trailer now</p>
                <h2 id="emergency-title">Emergency pickup</h2>
                <p className="muted">Tell us where you are, the bike, and a callback number.</p>
                <div style={{ marginTop: '1rem' }}>
                  <EmergencyForm onSuccess={() => setSent(true)} />
                </div>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setOpen(false)}
                  style={{ marginTop: '0.75rem' }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
