import { useState } from 'react';
import { Link } from 'react-router-dom';
import AtlantaPromo from '../components/AtlantaPromo';
import Calculator from '../components/Calculator';
import MediaStage from '../components/MediaStage';
import EmergencyModal from '../components/EmergencyModal';
import PartnerModal from '../components/PartnerModal';
import { leadReel } from '../brandMedia';
import { useGallery } from '../hooks/useGallery';
import jointLogoLight from '../assets/JointLogoLight.mp4';

export default function Home() {
  const homeMedia = useGallery('home');
  const [liveMedia, setLiveMedia] = useState(false);

  return (
    <>
      <section className={liveMedia ? 'hero has-media' : 'hero'}>
        <MediaStage items={homeMedia} leadOnce={leadReel} onActiveChange={setLiveMedia} />
        <div className="hero-inner">
          <p className="kicker">Emergency + Scheduled</p>
          <h1>MIKE'S BIKES</h1>
          <p className="kicker">Transportation Services</p>
          <p className="phone">
            267-404-<span className="red">MIKE</span> <span className="red">(6453)</span>
          </p>
          <p>Pickup / drop-off in Atlanta. Safe. Reliable. Fast response. All Bikes Welcome.</p>
          <p className="script" style={{ fontSize: '2rem' }}>
            We'll Come <em>Get You</em>!
          </p>
          <div className="cta-row">
            <EmergencyModal />
            <PartnerModal />
            <Link className="btn btn-quote" to="/quote">
              Instant quote
            </Link>
            <AtlantaPromo />
          </div>
          <div className="traits">
            <div className="trait">Safe</div>
            <div className="trait">Reliable</div>
            <div className="trait">Fast response</div>
            <div className="trait">All Bikes Welcome</div>
          </div>
        </div>
      </section>
      <section className="section grid-2">
        <Calculator />
        <div className="card">
          <video src={jointLogoLight} muted playsInline autoPlay loop aria-hidden />
          <h2 style={{ marginTop: '1rem' }}>Two ways we roll</h2>
          <p>Emergency pickup when you need a trailer now, or scheduled transport you can plan around.</p>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <Link className="btn btn-primary" to="/services">
              View services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
