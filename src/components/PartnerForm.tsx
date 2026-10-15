import { useState } from 'react';
import { api } from '../api';

const empty = {
  organization: '',
  name: '',
  email: '',
  phone: '',
  message: '',
};

const PARTNER_EMAIL = import.meta.env.VITE_PARTNER_EMAIL || 'pmleechapman@gmail.com';

type Props = {
  onSuccess?: () => void;
};

async function sendPartnershipEmail(fields: typeof empty) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(PARTNER_EMAIL)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      _subject: 'Mikes Bikes Partnership',
      _template: 'box',
      _captcha: 'false',
      organization: fields.organization,
      name: fields.name,
      email: fields.email,
      phone: fields.phone || 'n/a',
      message: fields.message,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === 'false' || data.success === false) {
    throw new Error(data.message || 'Could not send partnership email');
  }
}

export default function PartnerForm({ onSuccess }: Props) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      await sendPartnershipEmail(form);
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
          Organization
          <input
            required
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
          />
        </label>
        <label>
          Your name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
      </div>
      <div className="inline-fields">
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
      </div>
      <label>
        Message
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>
      {msg && <p className="error">{msg}</p>}
      <button className="btn btn-primary" disabled={busy}>
        {busy ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
