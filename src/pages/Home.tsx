import { Link } from 'react-router-dom';
import AtlantaPromo from '../components/AtlantaPromo';
import Calculator from '../components/Calculator';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="kicker">Emergency + scheduled</p>
          <h1>MIKE'S BIKE TRANSPORT SERVICE</h1>
          <p className="phone">
            267-404-<span className="red">MIKE</span> <span className="red">6453</span>
          </p>
          <p>Pickup / drop-off in Atlanta. Safe. Reliable. Fast response. All bikes welcome.</p>
          <p className="script" style={{ fontSize: '2rem' }}>
            We'll come <em>get you</em>
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/quote">
              Instant quote
            </Link>
            <a className="btn btn-ghost" href="tel:2674046453">
              Call now
            </a>
            <AtlantaPromo />
          </div>
          <div className="traits">
            <div className="trait">Safe</div>
            <div className="trait">Reliable</div>
            <div className="trait">Fast response</div>
            <div className="trait">All bikes welcome</div>
          </div>
        </div>
      </section>
      <section className="section grid-2">
        <Calculator />
        <div className="card">
          <img src="/brand/card-back.jpg" alt="We'll come get you — Mike's Bikes" />
          <h2 style={{ marginTop: '1rem' }}>Two ways we roll</h2>
          <p>Emergency pickup when you need a trailer now, or scheduled transport you can plan around.</p>
          <div className="cta-row" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <Link className="btn btn-primary" to="/services">
              View services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
