import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Vehicle } from '../types';

export default function Book() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const draft = sessionStorage.getItem('mb_quote');
  const quote = draft ? JSON.parse(draft) : null;

  useEffect(() => {
    if (!user) return;
    api<{ vehicles: Vehicle[] }>('/api/vehicles')
      .then((d) => setVehicles(d.vehicles))
      .catch(() => undefined);
  }, [user]);

  if (!user) {
    return (
      <section className="section">
        <h1>Book this haul</h1>
        <p>Log in or create an account to pay and confirm.</p>
        <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
          <Link className="btn btn-primary" to="/login" state={{ from: '/book' }}>
            Log in
          </Link>
          <Link className="btn btn-ghost" to="/register" state={{ from: '/book' }}>
            Join
          </Link>
        </div>
      </section>
    );
  }

  if (!quote) {
    return (
      <section className="section">
        <h1>No quote yet</h1>
        <Link className="btn btn-primary" to="/quote">
          Get a quote
        </Link>
      </section>
    );
  }

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        pickupAddress: quote.pickupAddress,
        dropoffAddress: quote.dropoffAddress,
        transportType: quote.transportType,
        serviceType: quote.serviceType,
        scheduledDate: quote.scheduledDate,
        operable: quote.operable,
        year: quote.year,
        make: quote.make,
        model: quote.model,
      };
      if (vehicleId) body.vehicleId = vehicleId;
      const data = await api<{ booking: { _id: string }; clientSecret: string }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      sessionStorage.setItem('mb_client_secret', data.clientSecret);
      navigate(`/checkout/${data.booking._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <h1>Confirm booking</h1>
      <div className="card">
        <p>
          {quote.pickupAddress} → {quote.dropoffAddress}
        </p>
        <p className="muted">
          {quote.miles} miles · {quote.transportType} · {quote.serviceType}
        </p>
        <p className="quote-total">${quote.quote.total.toFixed(2)}</p>
        <p>
          {quote.serviceType === 'scheduled'
            ? `Deposit due now (50%): $${quote.quote.depositDue.toFixed(2)}`
            : `Due in full before load: $${quote.quote.depositDue.toFixed(2)}`}
        </p>
        {quote.serviceType === 'emergency' && quote.insideI285 && (
          <p className="note-404">$10 off for cash transactions on emergency pickups inside I-285.</p>
        )}
        {quote.quote.discount404 > 0 && (
          <p className="note-404">404 discount applied (−${quote.quote.discount404.toFixed(2)})</p>
        )}
        <label>
          Use a saved motorcycle (optional)
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">New / from quote</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.year} {v.make} {v.model}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={loading} onClick={submit} style={{ marginTop: '1rem' }}>
          {loading ? 'Creating…' : quote.serviceType === 'scheduled' ? 'Pay deposit' : 'Pay in full'}
        </button>
      </div>
    </section>
  );
}
