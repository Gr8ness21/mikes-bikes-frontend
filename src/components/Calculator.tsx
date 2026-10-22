import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { QuoteResponse } from '../types';
import AddressFields, {
  addressReady,
  formatAddress,
  type AddressParts,
} from './AddressFields';
import MiniMap, { type MapPoint } from './MiniMap';

type Props = {
  defaultService?: 'emergency' | 'scheduled';
};

type Place = { lat: number; lng: number; displayName: string };

export type PlaceSuggestion = Place & AddressParts;

const emptyAddress: AddressParts = { street: '', city: '', state: 'GA', zip: '' };

function useGeocodedPlace(parts: AddressParts) {
  const [place, setPlace] = useState<Place | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!addressReady(parts)) {
      setPlace(null);
      setSuggestions([]);
      setError('');
      setNote('');
      return;
    }
    const handle = window.setTimeout(async () => {
      setLooking(true);
      setError('');
      setNote('');
      try {
        const data = await api<{
          place: Place | null;
          suggestions?: PlaceSuggestion[];
          message?: string | null;
        }>('/api/geo/lookup', {
          method: 'POST',
          body: JSON.stringify(parts),
        });
        setPlace(data.place);
        setSuggestions(data.suggestions || []);
        setError(data.place ? '' : data.message || 'No location found');
        setNote(data.place ? data.message || '' : '');
      } catch (err) {
        setPlace(null);
        setSuggestions([]);
        setError(err instanceof Error ? err.message : 'Could not place that address on the map');
      } finally {
        setLooking(false);
      }
    }, 700);
    return () => window.clearTimeout(handle);
  }, [parts.street, parts.city, parts.state, parts.zip]);

  return { place, suggestions, looking, error, note };
}

function SuggestionList({
  items,
  onPick,
}: {
  items: PlaceSuggestion[];
  onPick: (item: PlaceSuggestion) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="suggest-box">
      <p className="muted">Did you mean:</p>
      <ul className="suggest-list">
        {items.map((item) => (
          <li key={`${item.lat},${item.lng},${item.displayName}`}>
            <button type="button" onClick={() => onPick(item)}>
              {item.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Calculator({ defaultService = 'scheduled' }: Props) {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<AddressParts>(emptyAddress);
  const [dropoff, setDropoff] = useState<AddressParts>(emptyAddress);
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
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState('');

  const pickupGeo = useGeocodedPlace(pickup);
  const dropoffGeo = useGeocodedPlace(dropoff);

  useEffect(() => {
    api<{ blocked: string[] }>('/api/availability')
      .then((d) => setBlocked(d.blocked))
      .catch(() => undefined);
  }, []);

  async function shareCurrentLocation() {
    setLocationNote('');
    if (!navigator.geolocation) {
      setLocationNote('This browser cannot share GPS location.');
      return;
    }
    if (!window.isSecureContext) {
      setLocationNote('Location sharing needs HTTPS (or localhost).');
      return;
    }
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 15000,
        });
      });
      const data = await api<{
        place: Place & AddressParts;
      }>('/api/geo/reverse', {
        method: 'POST',
        body: JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      });
      setPickup({
        street: data.place.street || '',
        city: data.place.city || '',
        state: data.place.state || 'GA',
        zip: data.place.zip || '',
      });
      setLocationNote('Pickup set from your phone GPS. Confirm the street if it looks off.');
    } catch (err) {
      const geo = err as GeolocationPositionError;
      if (geo?.code === 1) {
        setLocationNote('Location permission was denied. You can still type the pickup address.');
      } else if (geo?.code === 2) {
        setLocationNote('GPS is unavailable right now. Try again or type the address.');
      } else if (geo?.code === 3) {
        setLocationNote('Location request timed out. Try again outdoors or type the address.');
      } else {
        setLocationNote(err instanceof Error ? err.message : 'Could not use current location');
      }
    } finally {
      setLocating(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api<QuoteResponse>('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          pickupAddress: formatAddress(pickup),
          dropoffAddress: formatAddress(dropoff),
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

  const pickupPoint: MapPoint[] = pickupGeo.place
    ? [{ ...pickupGeo.place, label: 'Pickup' }]
    : [];
  const dropoffPoint: MapPoint[] = dropoffGeo.place
    ? [{ ...dropoffGeo.place, label: 'Drop-off' }]
    : [];
  const routePoints: MapPoint[] =
    result?.pickup && result?.dropoff
      ? [
          { lat: result.pickup.lat, lng: result.pickup.lng, label: 'Pickup' },
          { lat: result.dropoff.lat, lng: result.dropoff.lng, label: 'Drop-off' },
        ]
      : [];

  return (
    <div className="card">
      <h2>Transport calculator</h2>
      <p className="muted">
        Open (economical) or enclosed (premium protection). Instant on-screen estimate, then book.
      </p>
      <form className="form" onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
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
        {serviceType === 'emergency' && (
          <p className="note-404">Inside I-285: $10 off for cash transactions.</p>
        )}
        <AddressFields
          id="pickup"
          title="Pickup Location | Where Is The Bike"
          value={pickup}
          onChange={setPickup}
          extra={
            serviceType === 'emergency' ? (
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={shareCurrentLocation}
                  disabled={locating}
                >
                  {locating ? 'Getting GPS…' : 'Use my current location'}
                </button>
                <p className="muted" style={{ marginTop: '0.4rem' }}>
                  On a phone, this asks for location permission and fills pickup from GPS.
                </p>
                {locationNote && <p className="muted">{locationNote}</p>}
              </div>
            ) : null
          }
        />
        {pickupGeo.looking && <p className="muted">Finding pickup on the map…</p>}
        {pickupGeo.error && <p className="error">{pickupGeo.error}</p>}
        {pickupGeo.note && <p className="muted">{pickupGeo.note}</p>}
        {(!pickupGeo.place || pickupGeo.note) && (
        <SuggestionList
          items={pickupGeo.suggestions}
          onPick={(item) =>
            setPickup({
              street: item.street || pickup.street,
              city: item.city || pickup.city,
              state: item.state || pickup.state,
              zip: item.zip || pickup.zip,
            })
          }
        />
        )}
        <MiniMap points={pickupPoint} label="Pickup location map" />
        <AddressFields
          id="dropoff"
          title="Dropoff Location. | Where Is The Bike Going"
          value={dropoff}
          onChange={setDropoff}
        />
        {dropoffGeo.looking && <p className="muted">Finding drop-off on the map…</p>}
        {dropoffGeo.error && <p className="error">{dropoffGeo.error}</p>}
        {dropoffGeo.note && <p className="muted">{dropoffGeo.note}</p>}
        {(!dropoffGeo.place || dropoffGeo.note) && (
        <SuggestionList
          items={dropoffGeo.suggestions}
          onPick={(item) =>
            setDropoff({
              street: item.street || dropoff.street,
              city: item.city || dropoff.city,
              state: item.state || dropoff.state,
              zip: item.zip || dropoff.zip,
            })
          }
        />
        )}
        <MiniMap points={dropoffPoint} label="Drop-off location map" />
        <fieldset className="address-block">
          <legend>Motorcycle info</legend>
          <div className="inline-fields">
            <label>
              Year
              <input
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label>
              Make
              <input required value={make} onChange={(e) => setMake(e.target.value)} />
            </label>
          </div>
          <label>
            Model
            <input required value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
        </fieldset>
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
          <p className="muted">
            {serviceType === 'scheduled'
              ? `50% deposit due now: $${result.quote.depositDue.toFixed(2)}`
              : `Due in full before load: $${result.quote.depositDue.toFixed(2)}`}
          </p>
          {serviceType === 'emergency' && result.insideI285 && (
            <p className="note-404">$10 off for cash transactions on emergency pickups inside I-285.</p>
          )}
          {result.quote.discount404 > 0 && (
            <p className="note-404">404 discount: −${result.quote.discount404.toFixed(2)}</p>
          )}
          <ul className="muted">
            {result.quote.breakdown.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          {routePoints.length === 2 && (
            <MiniMap
              points={routePoints}
              path={result.path}
              height={240}
              label="Route from pickup to drop-off"
            />
          )}
          <button className="btn btn-primary" onClick={() => navigate('/book')} style={{ marginTop: '1rem' }}>
            Book now
          </button>
        </div>
      )}
    </div>
  );
}
