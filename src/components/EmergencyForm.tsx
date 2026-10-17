import { useState } from 'react';
import { api } from '../api';
import type { QuoteResponse } from '../types';
import AddressFields, { formatAddress, type AddressParts } from './AddressFields';

const emptyAddress: AddressParts = { street: '', city: '', state: 'GA', zip: '' };

const empty = {
  name: '',
  email: '',
  phone: '',
  pickup: emptyAddress,
  dropoff: emptyAddress,
  year: '',
  make: '',
  model: '',
  operable: 'yes',
  notes: '',
};

const MAIL_TO = import.meta.env.VITE_PARTNER_EMAIL || 'pmleechapman@gmail.com';

type Props = {
  onSuccess?: () => void;
};

async function sendEmergencyEmail(payload: Record<string, string>) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(MAIL_TO)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      _subject: 'Mikes Bikes Emergency Pickup',
      _template: 'box',
      _captcha: 'false',
      ...payload,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === 'false' || data.success === false) {
    throw new Error(data.message || 'Could not send emergency email');
  }
}

export default function EmergencyForm({ onSuccess }: Props) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    const pickupAddress = formatAddress(form.pickup);
    const dropoffAddress = formatAddress(form.dropoff);
    const bike = [form.year, form.make, form.model].filter(Boolean).join(' ') || 'n/a';
    let estimatedTotal = 'Could not estimate';
    try {
      const priced = await api<QuoteResponse>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          pickupAddress,
          dropoffAddress,
          transportType: 'open',
          operable: form.operable === 'yes',
          serviceType: 'emergency',
        }),
      });
      estimatedTotal = `$${priced.quote.total.toFixed(2)}`;
      if (priced.quote.i285Applied) estimatedTotal += ' (I-285 flat rate)';
      if (priced.miles != null) estimatedTotal += ` · ${priced.miles.toFixed(1)} mi`;
    } catch {
      estimatedTotal = 'Could not estimate (address lookup failed)';
    }
    try {
      await api('/api/emergency', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          pickupAddress,
          dropoffAddress,
          year: form.year,
          make: form.make,
          model: form.model,
          operable: form.operable === 'yes',
          notes: form.notes,
          estimatedTotal,
        }),
      });
      await sendEmergencyEmail({
        name: form.name,
        email: form.email,
        phone: form.phone,
        pickup: pickupAddress,
        dropoff: dropoffAddress || 'n/a',
        bike,
        operable: form.operable === 'yes' ? 'Operable' : 'Inoperable',
        notes: form.notes || 'n/a',
        estimated_total: estimatedTotal,
      });
      setForm(empty);
      onSuccess?.();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="inline-fields">
        <label>
          Your name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Phone
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
      </div>
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <AddressFields
        id="emergency-pickup"
        title="Pickup location"
        value={form.pickup}
        onChange={(pickup) => setForm({ ...form, pickup })}
      />
      <AddressFields
        id="emergency-dropoff"
        title="Drop-off location"
        value={form.dropoff}
        onChange={(dropoff) => setForm({ ...form, dropoff })}
      />
      <div className="inline-fields">
        <label>
          Year
          <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
        </label>
        <label>
          Make
          <input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
        </label>
        <label>
          Model
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        </label>
      </div>
      <label>
        Motorcycle condition
        <select value={form.operable} onChange={(e) => setForm({ ...form, operable: e.target.value })}>
          <option value="yes">Operable</option>
          <option value="no">Inoperable</option>
        </select>
      </label>
      <label>
        What happened?
        <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      {msg && <p className="error">{msg}</p>}
      <button className="btn btn-emergency" disabled={busy}>
        {busy ? 'Sending…' : 'Request emergency pickup'}
      </button>
    </form>
  );
}
