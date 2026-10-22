import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api } from '../api';
import type { Booking } from '../types';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = pk ? loadStripe(pk) : null;

function PayForm({ bookingId, scheduled }: { bookingId: string; scheduled: boolean }) {
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
        {busy ? 'Processing…' : scheduled ? 'Pay 50% deposit' : 'Pay in full'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(sessionStorage.getItem('mb_client_secret') || '');
  const [stripeConfigured, setStripeConfigured] = useState(Boolean(pk));
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<{ clientSecret: string | null; stripeConfigured: boolean; booking: Booking }>(
      `/api/bookings/${id}/payment-secret`
    )
      .then((data) => {
        setBooking(data.booking);
        setStripeConfigured(data.stripeConfigured);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          sessionStorage.setItem('mb_client_secret', data.clientSecret);
        }
        setReady(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load checkout');
        setReady(true);
      });
  }, [id]);

  async function simulate() {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/bookings/${id}/simulate-deposit`, { method: 'POST' });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not simulate deposit');
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <section className="section">
        <h1>Missing booking</h1>
      </section>
    );
  }

  return (
    <section className="section">
      <h1>{booking?.serviceType === 'scheduled' ? 'Deposit checkout' : 'Pay in full'}</h1>
      <p className="muted">
        {booking?.serviceType === 'scheduled'
          ? 'Pickup is not initiated until this 50% deposit succeeds.'
          : 'The bike is not loaded until this payment succeeds in full.'}
      </p>
      {booking && (
        <p className="quote-total">${booking.quote.depositDue.toFixed(2)} due now</p>
      )}
      {error && <p className="error">{error}</p>}
      {!ready && <p className="muted">Loading checkout…</p>}
      {ready && pk && stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <PayForm bookingId={id} scheduled={booking?.serviceType === 'scheduled'} />
        </Elements>
      )}
      {ready && stripeConfigured && !clientSecret && (
        <p className="muted">Waiting for a Stripe payment session…</p>
      )}
      {ready && !stripeConfigured && (
        <div className="card">
          <h2>Stripe test keys not set yet</h2>
          <p>
            Add <code>STRIPE_SECRET_KEY</code> in <code>backend/.env</code> and{' '}
            <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in <code>frontend/.env</code>, then restart both
            servers to collect a real card payment.
          </p>
          <p className="muted">Until then you can simulate payment so the rest of the booking flow works.</p>
          <button className="btn btn-primary" disabled={busy} onClick={simulate}>
            {busy ? 'Saving…' : booking?.serviceType === 'scheduled' ? 'Simulate 50% deposit' : 'Simulate payment'}
          </button>
        </div>
      )}
    </section>
  );
}
