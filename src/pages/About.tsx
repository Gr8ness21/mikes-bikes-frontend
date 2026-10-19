import { useEffect, useState } from 'react';
import GalleryCarousel from '../components/GalleryCarousel';
import PartnerForm from '../components/PartnerForm';
import { leadReel } from '../brandMedia';
import { useGallery } from '../hooks/useGallery';

const reviews = [
  {
    name: 'Jordan P.',
    quote: 'Broke down outside the perimeter. Mike had a trailer on me faster than a rideshare.',
  },
  {
    name: 'Alicia M.',
    quote: 'Enclosed haul for my sportbike to a track day. Strapped right, no drama, fair quote.',
  },
  {
    name: 'Chris D.',
    quote: 'Used the I-285 flat rate to move a project bike across town. Seventy bucks. Done.',
  },
];

export default function About() {
  const [msg, setMsg] = useState('');
  const [i, setI] = useState(0);
  const aboutMedia = useGallery('about');

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % reviews.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="section">
      <p className="kicker">The shop</p>
      <h1>About Mike's Bikes</h1>
      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h2>History & purpose</h2>
          <p>
            Mike is an Atlanta native — a Grady Baby — with a love for bikes since childhood and a
            deep love for the city. Mike's Bikes Transportation Services moves motorcycles across
            Atlanta and beyond: emergency recoveries and planned hauls, built to serve the
            community at large. Open trailers keep it economical. Enclosed keeps it premium and
            protected.
          </p>
          <p>
            The shop has big aspirations: growth and partnerships with clubs and dealerships across
            the Southeast.
          </p>
          <p>The promise on the card is the operating plan:</p>
          <p className="script" style={{ fontSize: '1.8rem', marginTop: '1rem' }}>
            We'll Come <em>Get You</em>!
          </p>
          <p className="muted">Pickup and drop-off in Atlanta · 267-404-MIKE</p>
        </div>
        <div className="card slideshow">
          <h2>Riders we've served</h2>
          <div className="slides">
            <blockquote>
              <p>“{reviews[i].quote}”</p>
              <p className="muted">— {reviews[i].name}</p>
            </blockquote>
          </div>
          <button className="btn btn-ghost" onClick={() => setI((n) => (n + 1) % reviews.length)}>
            Next review
          </button>
        </div>
      </div>
      <GalleryCarousel
        leadOnce={leadReel}
        items={
          aboutMedia.length
            ? aboutMedia
            : [
                {
                  _id: 'fallback',
                  url: '/brand/card-front.jpg',
                  originalName: 'brand',
                  kind: 'image',
                  alt: "Mike's Bikes",
                  showOnHome: true,
                  showOnAbout: true,
                  order: 0,
                },
              ]
        }
      />
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Partner with us</h2>
        <p className="muted">Shops, clubs, and fleets looking for a transport partner — send a note.</p>
        {msg && <p className="success">{msg}</p>}
        <div style={{ marginTop: '1rem' }}>
          <PartnerForm onSuccess={() => setMsg('Message sent. We will reach out soon.')} />
        </div>
      </div>
    </section>
  );
}
