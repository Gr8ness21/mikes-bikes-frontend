import { useEffect, useState } from 'react';
import PartnerForm from './PartnerForm';

export default function PartnerModal() {
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
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
        Partner With Us
      </button>
      {open && (
        <div
          className={`modal-backdrop ${fading ? 'is-fading' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="partner-title"
        >
          <div className="card modal">
            {sent ? (
              <p className="success" role="status">
                Message sent. We will reach out soon.
              </p>
            ) : (
              <>
                <p className="kicker">Shops, clubs, fleets</p>
                <h2 id="partner-title">Partner with us</h2>
                <p className="muted">Tell us about your shop or fleet and we will get back to you.</p>
                <div style={{ marginTop: '1rem' }}>
                  <PartnerForm onSuccess={() => setSent(true)} />
                </div>
                <button type="button" className="linkish" onClick={() => setOpen(false)} style={{ marginTop: '0.75rem' }}>
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
