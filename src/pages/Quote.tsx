import Calculator from '../components/Calculator';

export default function Quote() {
  return (
    <section className="section">
      <p className="kicker">Know the number first</p>
      <h1>Instant quote</h1>
      <p className="lede muted">
        Distance from OpenStreetMap routing, your rate table, enclosed premium, seasonal
        multipliers, I-285 flat rate, and the 404 inoperable discount.
      </p>
      <Calculator />
    </section>
  );
}
