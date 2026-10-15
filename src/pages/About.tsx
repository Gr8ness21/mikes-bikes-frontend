import { useEffect, useState } from 'react';
import { api } from '../api';

const reviews = [
  {
    name: 'Jordan P.',
    quote: 'Broke down outside the perimeter. Mike had a trailer on me faster than a rideshare.',
  },
  {
    name: 'Alicia M.',
    quote: 'Enclosed haul for my sportbike to a track day. Strapped right, no drama, fair quote.',
  },
  {
    name: 'Chris D.',
    quote: 'Used the I-285 flat rate to move a project bike across town. Seventy bucks. Done.',
  },
];

export default function About() {
  const [form, setForm] = useState({
    organization: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [msg, setMsg] = useState('');
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % reviews.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      setMsg('Message sent. We will reach out soon.');
      setForm({ organization: '', name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not send');
    }
  }

  return (
    <section className="section">
      <p className="kicker">The shop</p>
      <h1>About Mike's Bikes</h1>
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h2>History & purpose</h2>
          <p>
            Mike's Bikes Transportation Services moves motorcycles across Atlanta and beyond —
            emergency recoveries and planned hauls. Open trailers keep it economical. Enclosed
            keeps it premium and protected. The promise on the card is the operating plan:
          </p>
          <p className="script" style={{ fontSize: '1.8rem', marginTop: '1rem' }}>
            We'll come <em>get you</em>.
          </p>
          <p className="muted">Pickup and drop-off in Atlanta · 267-404-MIKE</p>
        </div>
        <div className="card slideshow">
          <h2>Riders we've served</h2>
          <div className="slides">
            <img
              src={i % 2 === 0 ? '/brand/card-front.jpg' : '/brand/card-back.jpg'}
              alt="Customer transport"
            />
            <blockquote>
              <p>“{reviews[i].quote}”</p>
              <p className="muted">— {reviews[i].name}</p>
            </blockquote>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setI((n) => (n + 1) % reviews.length)}
          >
            Next review
          </button>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Partner with us</h2>
        <p className="muted">Shops, clubs, and fleets looking for a transport partner — send a note.</p>
        <form className="form" onSubmit={submit} style={{ marginTop: '1rem' }}>
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
          {msg && <p className={msg.startsWith('Message') ? 'success' : 'error'}>{msg}</p>}
          <button className="btn btn-primary">Send</button>
        </form>
      </div>
    </section>
  );
}
