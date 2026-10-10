import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { QuoteResponse } from '../types';

type Props = {
  defaultService?: 'emergency' | 'scheduled';
};

export default function Calculator({ defaultService = 'scheduled' }: Props) {
  const navigate = useNavigate();
  const [pickupAddress, setPickup] = useState('');
  const [dropoffAddress, setDropoff] = useState('');
  const [transportType, setType] = useState<'open' | 'enclosed'>('open');
  const [serviceType, setService] = useState(defaultService);
  const [scheduledDate, setDate] = useState('');
  const [operable, setOperable] = useState(true);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<QuoteResponse | null>(null);

  useEffect(() => {
    api<{ blocked: string[] }>('/api/availability')
      .then((d) => setBlocked(d.blocked))
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<QuoteResponse>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          pickupAddress,
          dropoffAddress,
          transportType,
          serviceType,
          scheduledDate: serviceType === 'scheduled' ? scheduledDate : undefined,
          operable,
        }),
      });
      setResult(data);
      sessionStorage.setItem(
        'mb_quote',
        JSON.stringify({ ...data, year, make, model, scheduledDate, serviceType, operable })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not quote');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Transport calculator</h2>
      <p className="muted">
        Open (economical) or enclosed (premium protection). Instant on-screen estimate, then book.
      </p>
      <form className="form" onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
        <div className="inline-fields">
          <label>
            Pickup location
            <input
              required
              value={pickupAddress}
              onChange={(e) => setPickup(e.target.value)}
              autoComplete="street-address"
            />
          </label>
          <label>
            Drop-off location
            <input
              required
              value={dropoffAddress}
              onChange={(e) => setDropoff(e.target.value)}
              autoComplete="street-address"
            />
          </label>
        </div>
        <div className="inline-fields">
          <label>
            Year
            <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
          </label>
          <label>
            Make
            <input value={make} onChange={(e) => setMake(e.target.value)} />
          </label>
        </div>
        <label>
          Model
          <input value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
        <div className="inline-fields">
          <label>
            Transport type
            <select
              value={transportType}
              onChange={(e) => setType(e.target.value as 'open' | 'enclosed')}
            >
              <option value="open">Open — economical</option>
              <option value="enclosed">Enclosed — premium protected</option>
            </select>
          </label>
          <label>
            Request type
            <select
              value={serviceType}
              onChange={(e) => setService(e.target.value as 'emergency' | 'scheduled')}
            >
              <option value="emergency">Emergency pickup</option>
              <option value="scheduled">Scheduled transport</option>
            </select>
          </label>
        </div>
        {serviceType === 'scheduled' && (
          <label>
            Desired date
            <input
              type="date"
              required
              value={scheduledDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
            {blocked.includes(scheduledDate) && (
              <span className="error">That date is unavailable.</span>
            )}
          </label>
        )}
        <label>
          Motorcycle condition
          <select value={operable ? 'yes' : 'no'} onChange={(e) => setOperable(e.target.value === 'yes')}>
            <option value="yes">Operable</option>
            <option value="no">Inoperable</option>
          </select>
        </label>
        {!operable && (
          <p className="note-404">
            The <strong>404 discount</strong> applies: 4.04% off because the bike is inoperable.
          </p>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={loading || blocked.includes(scheduledDate)}>
          {loading ? 'Calculating…' : 'Get estimate'}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: '1.25rem' }}>
          <p className="muted">
            {result.miles} miles
            {result.insideI285 ? ' · inside I-285 promo' : ''}
          </p>
          <p className="quote-total">${result.quote.total.toFixed(2)}</p>
          <p className="muted">50% deposit due now: ${result.quote.depositDue.toFixed(2)}</p>
          {result.quote.discount404 > 0 && (
            <p className="note-404">404 discount: −${result.quote.discount404.toFixed(2)}</p>
          )}
          <ul className="muted">
            {result.quote.breakdown.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={() => navigate('/book')}>
            Book now
          </button>
        </div>
      )}
    </div>
  );
}
