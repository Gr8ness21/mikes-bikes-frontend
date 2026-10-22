import { useEffect, useState } from 'react';

export function PromoPrice() {
  return (
    <span className="promo-price">
      <s>$70</s>
      <strong>$60</strong>
    </span>
  );
}

export default function AtlantaPromo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('mb_promo');
    if (!seen) {
      const t = window.setTimeout(() => setOpen(true), 700);
      return () => window.clearTimeout(t);
    }
  }, []);

  if (!open) {
    return (
      <button className="btn btn-ghost" onClick={() => setOpen(true)}>
        Atlanta <PromoPrice /> flat rate
      </button>
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-labelledby="promo-title">
      <div className="card modal promo">
        <p className="kicker">Inside I-285</p>
        <h2 id="promo-title">Atlanta flat rate</h2>
        <p>
          If your pickup and drop-off are both inside the I-285 perimeter, your transport is a
          flat <PromoPrice />.
        </p>
        <div className="cta-row" style={{ marginTop: '1rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => {
              sessionStorage.setItem('mb_promo', '1');
              setOpen(false);
            }}
          >
            Let's ride
          </button>
        </div>
      </div>
    </div>
  );
}
