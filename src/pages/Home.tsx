import { useState } from 'react';
import { Link } from 'react-router-dom';
import AtlantaPromo from '../components/AtlantaPromo';
import Calculator from '../components/Calculator';
import MediaStage from '../components/MediaStage';
import EmergencyModal from '../components/EmergencyModal';
import PartnerModal from '../components/PartnerModal';
import { mediaUrl } from '../api';
import { withLeadReel } from '../brandMedia';
import { useGallery } from '../hooks/useGallery';

export default function Home() {
  const homeMedia = useGallery('home');
  const stageMedia = withLeadReel(homeMedia);
  const [liveMedia, setLiveMedia] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const cover = homeMedia[0];

  return (
    <>
      <section className={liveMedia ? 'hero has-media' : 'hero'}>
        <MediaStage items={stageMedia} onActiveChange={setLiveMedia} />
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
          {cover && !coverBroken && cover.kind === 'video' ? (
            <video src={mediaUrl(cover.url)} muted playsInline autoPlay loop onError={() => setCoverBroken(true)} />
          ) : (
            <img
              src={cover && !coverBroken ? mediaUrl(cover.url) : '/brand/card-back.jpg'}
              alt={cover?.alt || "We'll Come Get You! — Mike's Bikes"}
              onError={() => setCoverBroken(true)}
            />
          )}
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
