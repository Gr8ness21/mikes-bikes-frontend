import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Booking, Vehicle } from '../types';

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ year: '', make: '', model: '', operable: true });
  const [error, setError] = useState('');

  async function load() {
    const [v, b] = await Promise.all([
      api<{ vehicles: Vehicle[] }>('/api/vehicles'),
      api<{ bookings: Booking[] }>('/api/bookings'),
    ]);
    setVehicles(v.vehicles);
    setBookings(b.bookings);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function addBike(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify({
        year: Number(form.year),
        make: form.make,
        model: form.model,
        operable: form.operable,
      }),
    });
    setForm({ year: '', make: '', model: '', operable: true });
    await load();
  }

  async function cancel(id: string) {
    await api(`/api/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    await load();
  }

  return (
    <section className="section">
      <h1>My garage</h1>
      {error && <p className="error">{error}</p>}
      <div className="grid-2">
        <div className="card">
          <h2>Motorcycles</h2>
          <form className="form" onSubmit={addBike}>
            <div className="inline-fields">
              <label>
                Year
                <input
                  required
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </label>
              <label>
                Make
                <input
                  required
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                />
              </label>
            </div>
            <label>
              Model
              <input
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </label>
            <label>
              Condition
              <select
                value={form.operable ? 'yes' : 'no'}
                onChange={(e) => setForm({ ...form, operable: e.target.value === 'yes' })}
              >
                <option value="yes">Operable</option>
                <option value="no">Inoperable (404 discount)</option>
              </select>
            </label>
            <button className="btn btn-primary">Save bike</button>
          </form>
          <ul>
            {vehicles.map((v) => (
              <li key={v._id}>
                {v.year} {v.make} {v.model} {v.operable ? '' : '· inoperable'}{' '}
                <button
                  className="linkish"
                  onClick={async () => {
                    await api(`/api/vehicles/${v._id}`, { method: 'DELETE' });
                    await load();
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card table-wrap">
          <h2>Bookings</h2>
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Route</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.scheduledDate ? b.scheduledDate.slice(0, 10) : 'ASAP'}</td>
                  <td>
                    {b.pickupAddress} → {b.dropoffAddress}
                    <div className="muted">${b.quote?.total?.toFixed(2)}</div>
                  </td>
                  <td>{b.status.replaceAll('_', ' ')}</td>
                  <td>
                    {['pending_deposit', 'deposit_paid', 'scheduled'].includes(b.status) && (
                      <button className="linkish" onClick={() => cancel(b._id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
