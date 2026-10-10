import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '../api';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = pk ? loadStripe(pk) : null;

function PayForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setBusy(false);
      return;
    }
    try {
      await api(`/api/bookings/${bookingId}/confirm-deposit`, { method: 'POST' });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm');
      setBusy(false);
    }
  }

  return (
    <form className="form card" onSubmit={onSubmit}>
      <PaymentElement />
      {error && <p className="error">{error}</p>}
      <button className="btn btn-primary" disabled={busy || !stripe}>
        {busy ? 'Processing…' : 'Pay 50% deposit'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { id } = useParams();
  const clientSecret = sessionStorage.getItem('mb_client_secret') || '';

  useEffect(() => {
    return () => undefined;
  }, []);

  if (!pk || !stripePromise) {
    return (
      <section className="section">
        <h1>Stripe not configured</h1>
        <p>Add VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env and STRIPE_SECRET_KEY in backend/.env.</p>
      </section>
    );
  }

  if (!clientSecret || !id) {
    return (
      <section className="section">
        <h1>Missing payment session</h1>
        <p>Start from a quote and book again.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <h1>Deposit checkout</h1>
      <p className="muted">Pickup is not initiated until this half-payment succeeds.</p>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
        <PayForm bookingId={id} />
      </Elements>
    </section>
  );
}
