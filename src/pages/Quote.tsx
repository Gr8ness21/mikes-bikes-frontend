import Calculator from '../components/Calculator';

export default function Quote() {
  return (
    <section className="section">
      <p className="kicker">Know the number first</p>
      <h1>Instant quote</h1>
      <p className="lede muted">
        Scheduled pickup and drop-off available for Georgia, Florida, Tennessee, Alabama, and the
        Carolinas. For inquiries of multiple bikes, please fill out the partnership form.
      </p>
      <Calculator />
    </section>
  );
}
