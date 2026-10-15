import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Booking } from '../types';

type Rates = {
  brackets: { maxMiles: number; perMile: number }[];
  enclosedMultiplier: number;
  inoperableDiscountPct: number;
  i285FlatRate: number;
  minimumOpen: number;
  minimumEnclosed: number;
  dailyScheduledCapacity: number;
};

type Seasonal = { _id: string; name: string; startDate: string; endDate: string; multiplier: number };
type Blackout = { _id: string; startDate: string; endDate: string; reason: string };
type Inquiry = {
  _id: string;
  organization: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const bookingStatuses = [
  'pending_deposit',
  'deposit_paid',
  'scheduled',
  'cancelled',
  'in_transit',
  'delivered',
];

export default function Admin() {
  const [config, setConfig] = useState<Rates | null>(null);
  const [seasonal, setSeasonal] = useState<Seasonal[]>([]);
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [seasonForm, setSeasonForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    multiplier: '1.2',
  });
  const [blackForm, setBlackForm] = useState({ startDate: '', endDate: '', reason: '' });

  async function load() {
    const [rates, blacks, books, partners] = await Promise.all([
      api<{ config: Rates; seasonal: Seasonal[] }>('/api/admin/rates'),
      api<{ blackouts: Blackout[] }>('/api/admin/blackouts'),
      api<{ bookings: Booking[] }>('/api/bookings'),
      api<{ inquiries: Inquiry[] }>('/api/admin/inquiries'),
    ]);
    setConfig(rates.config);
    setSeasonal(rates.seasonal);
    setBlackouts(blacks.blackouts);
    setBookings(books.bookings);
    setInquiries(partners.inquiries);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function saveRates(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    await api('/api/admin/rates', { method: 'PUT', body: JSON.stringify(config) });
    setMsg('Rates saved');
    await load();
  }

  if (!config) return <section className="section">Loading admin…</section>;

  return (
    <section className="section">
      <h1>Admin</h1>
      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}
      <div className="grid-2">
        <form className="card form" onSubmit={saveRates}>
          <h2>Base rates</h2>
          {config.brackets.map((b, idx) => (
            <div className="inline-fields" key={idx}>
              <label>
                Max miles
                <input
                  type="number"
                  value={b.maxMiles}
                  onChange={(e) => {
                    const brackets = [...config.brackets];
                    brackets[idx] = { ...b, maxMiles: Number(e.target.value) };
                    setConfig({ ...config, brackets });
                  }}
                />
              </label>
              <label>
                $ / mile
                <input
                  type="number"
                  step="0.01"
                  value={b.perMile}
                  onChange={(e) => {
                    const brackets = [...config.brackets];
                    brackets[idx] = { ...b, perMile: Number(e.target.value) };
                    setConfig({ ...config, brackets });
                  }}
                />
              </label>
            </div>
          ))}
          <div className="inline-fields">
            <label>
              Enclosed multiplier
              <input
                type="number"
                step="0.01"
                value={config.enclosedMultiplier}
                onChange={(e) =>
                  setConfig({ ...config, enclosedMultiplier: Number(e.target.value) })
                }
              />
            </label>
            <label>
              I-285 flat $
              <input
                type="number"
                value={config.i285FlatRate}
                onChange={(e) => setConfig({ ...config, i285FlatRate: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="inline-fields">
            <label>
              404 discount %
              <input
                type="number"
                step="0.01"
                value={config.inoperableDiscountPct}
                onChange={(e) =>
                  setConfig({ ...config, inoperableDiscountPct: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Daily scheduled slots
              <input
                type="number"
                value={config.dailyScheduledCapacity}
                onChange={(e) =>
                  setConfig({ ...config, dailyScheduledCapacity: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="inline-fields">
            <label>
              Min open $
              <input
                type="number"
                value={config.minimumOpen}
                onChange={(e) => setConfig({ ...config, minimumOpen: Number(e.target.value) })}
              />
            </label>
            <label>
              Min enclosed $
              <input
                type="number"
                value={config.minimumEnclosed}
                onChange={(e) => setConfig({ ...config, minimumEnclosed: Number(e.target.value) })}
              />
            </label>
          </div>
          <button className="btn btn-primary">Save rates</button>
        </form>
        <div className="card">
          <h2>Seasonal / holiday multipliers</h2>
          <form
            className="form"
            onSubmit={async (e) => {
              e.preventDefault();
              await api('/api/admin/seasonal', {
                method: 'POST',
                body: JSON.stringify({
                  ...seasonForm,
                  multiplier: Number(seasonForm.multiplier),
                }),
              });
              setSeasonForm({ name: '', startDate: '', endDate: '', multiplier: '1.2' });
              await load();
            }}
          >
            <label>
              Name
              <input
                required
                value={seasonForm.name}
                onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
              />
            </label>
            <div className="inline-fields">
              <label>
                Start
                <input
                  type="date"
                  required
                  value={seasonForm.startDate}
                  onChange={(e) => setSeasonForm({ ...seasonForm, startDate: e.target.value })}
                />
              </label>
              <label>
                End
                <input
                  type="date"
                  required
                  value={seasonForm.endDate}
                  onChange={(e) => setSeasonForm({ ...seasonForm, endDate: e.target.value })}
                />
              </label>
            </div>
            <label>
              Multiplier
              <input
                value={seasonForm.multiplier}
                onChange={(e) => setSeasonForm({ ...seasonForm, multiplier: e.target.value })}
              />
            </label>
            <button className="btn btn-primary">Add season</button>
          </form>
          <ul>
            {seasonal.map((s) => (
              <li key={s._id}>
                {s.name} × {s.multiplier} ({s.startDate.slice(0, 10)} – {s.endDate.slice(0, 10)}){' '}
                <button
                  className="linkish"
                  onClick={async () => {
                    await api(`/api/admin/seasonal/${s._id}`, { method: 'DELETE' });
                    await load();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <h2>Blackout dates</h2>
        <form
          className="form"
          onSubmit={async (e) => {
            e.preventDefault();
            await api('/api/admin/blackouts', { method: 'POST', body: JSON.stringify(blackForm) });
            setBlackForm({ startDate: '', endDate: '', reason: '' });
            await load();
          }}
        >
          <div className="inline-fields">
            <label>
              Start
              <input
                type="date"
                required
                value={blackForm.startDate}
                onChange={(e) => setBlackForm({ ...blackForm, startDate: e.target.value })}
              />
            </label>
            <label>
              End
              <input
                type="date"
                required
                value={blackForm.endDate}
                onChange={(e) => setBlackForm({ ...blackForm, endDate: e.target.value })}
              />
            </label>
          </div>
          <label>
            Reason
            <input
              value={blackForm.reason}
              onChange={(e) => setBlackForm({ ...blackForm, reason: e.target.value })}
            />
          </label>
          <button className="btn btn-primary">Black out</button>
        </form>
        <ul>
          {blackouts.map((b) => (
            <li key={b._id}>
              {b.startDate.slice(0, 10)} – {b.endDate.slice(0, 10)} {b.reason}{' '}
              <button
                className="linkish"
                onClick={async () => {
                  await api(`/api/admin/blackouts/${b._id}`, { method: 'DELETE' });
                  await load();
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="card table-wrap" style={{ marginTop: '1.25rem' }}>
        <h2>All bookings</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>When</th>
              <th>Route</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>
                  <select
                    aria-label={`Status for booking ${b._id}`}
                    value={b.status}
                    onChange={async (e) => {
                      await api(`/api/bookings/${b._id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: e.target.value }),
                      });
                      await load();
                    }}
                  >
                    {bookingStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{b.scheduledDate ? b.scheduledDate.slice(0, 10) : 'ASAP'}</td>
                <td>
                  {b.pickupAddress} → {b.dropoffAddress}
                </td>
                <td>${b.quote?.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <h2>Partner inquiries</h2>
        {inquiries.length === 0 && <p className="muted">None yet.</p>}
        <ul>
          {inquiries.map((q) => (
            <li key={q._id}>
              <strong>{q.organization}</strong> — {q.name} ({q.email}
              {q.phone ? ` · ${q.phone}` : ''})
              <p className="muted">{q.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
