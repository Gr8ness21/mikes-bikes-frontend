import type { ReactNode } from 'react';

export type AddressParts = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export function formatAddress(parts: AddressParts) {
  return [parts.street, parts.city, parts.state, parts.zip]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export function addressReady(parts: AddressParts) {
  return Boolean(parts.city.trim() && parts.state.trim());
}

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

type Props = {
  id: string;
  title: string;
  value: AddressParts;
  onChange: (next: AddressParts) => void;
  extra?: ReactNode;
};

export default function AddressFields({ id, title, value, onChange, extra }: Props) {
  function set<K extends keyof AddressParts>(key: K, next: AddressParts[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <fieldset className="address-block">
      <legend>{title}</legend>
      {extra}
      <label>
        Street
        <input
          id={`${id}-street`}
          required
          autoComplete="address-line1"
          value={value.street}
          onChange={(e) => set('street', e.target.value)}
        />
      </label>
      <div className="address-city-row">
        <label>
          City
          <input
            id={`${id}-city`}
            required
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </label>
        <label>
          State
          <select
            id={`${id}-state`}
            required
            autoComplete="address-level1"
            value={value.state}
            onChange={(e) => set('state', e.target.value)}
          >
            <option value="">Select</option>
            {STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </label>
        <label>
          ZIP
          <input
            id={`${id}-zip`}
            required
            autoComplete="postal-code"
            inputMode="numeric"
            value={value.zip}
            onChange={(e) => set('zip', e.target.value)}
          />
        </label>
      </div>
    </fieldset>
  );
}
