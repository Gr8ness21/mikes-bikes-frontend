import { Link } from 'react-router-dom';
import FaqCarousel from '../components/FaqCarousel';
import jointLogoDark from '../assets/JointLogoDark.mp4';

export default function Services() {
  return (
    <>
    <section className="section">
      <div className="section-head">
        <div>
          <p className="kicker">What we do</p>
          <h1>Services</h1>
        </div>
      </div>
      <div className="services">
        <article className="service">
          <video className="service-media" src={jointLogoDark} muted playsInline autoPlay loop aria-hidden />
          <h2>Emergency pickup</h2>
          <p>Share your current location, destination, and bike details. Get a price, then dispatch.</p>
          <Link className="btn btn-primary" to="/quote">
            Request emergency
          </Link>
        </article>
        <article className="service">
          <video className="service-media" src={jointLogoDark} muted playsInline autoPlay loop aria-hidden />
          <h2>Scheduled transport</h2>
          <p>Pick a future date. Open or enclosed. Half the payment is due before pickup starts.</p>
          <Link className="btn btn-primary" to="/quote">
            Schedule a haul
          </Link>
        </article>
        <article className="service sub">
          <h3>Gas delivery</h3>
          <p className="muted">Roadside fuel drop — membership perk coming online next.</p>
        </article>
        <article className="service sub">
          <h3>Tire assistance</h3>
          <p className="muted">Fix-a-flat / spare change support. Full roadside flow in a later release.</p>
        </article>
      </div>
    </section>
    <FaqCarousel />
    </>
  );
}
