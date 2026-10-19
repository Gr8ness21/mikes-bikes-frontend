import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import jointLogoDark from '../assets/JointLogoDark.mp4';
import jointLogoLight from '../assets/JointLogoLight.mp4';

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'How long does it take to get a quote?',
    a: (
      <>
        Immediately, click the link in the navigation bar above.{' '}
        <Link to="/quote">Instant quote</Link>
      </>
    ),
  },
  {
    q: 'What are your hours of operation?',
    a: 'We are currently in the fall riding season in the southeast. Scheduled Transport hours are anytime M-F. Emergency Pickup available between 5PM and 3AM Monday - Sunday.',
  },
  {
    q: 'What if my bike is in a difficult to reach area?',
    a: "We'll figure it out together. We can't scale cliffsides but we'll help you out of a ditch no problem.",
  },
];

export default function FaqCarousel() {
  const { theme } = useTheme();
  const [i, setI] = useState(0);
  const logoSrc = theme === 'light' ? jointLogoDark : jointLogoLight;

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % faqs.length), 8000);
    return () => window.clearInterval(t);
  }, []);

  const item = faqs[i];

  return (
    <section className="faq-parallax" aria-labelledby="faq-title">
      <div className="faq-parallax-media" aria-hidden>
        <video key={logoSrc} src={logoSrc} muted playsInline autoPlay loop />
      </div>
      <div className="faq-inner card">
        <p className="kicker">FAQ</p>
        <h2 id="faq-title">Frequently asked questions</h2>
        <div className="faq-slide" aria-live="polite">
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </div>
        <div className="faq-controls">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setI((n) => (n + faqs.length - 1) % faqs.length)}
          >
            Previous
          </button>
          <div className="faq-dots" role="tablist" aria-label="FAQ slides">
            {faqs.map((faq, idx) => (
              <button
                key={faq.q}
                type="button"
                role="tab"
                aria-selected={idx === i}
                className={idx === i ? 'is-active' : ''}
                onClick={() => setI(idx)}
              >
                <span className="sr-only">{faq.q}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setI((n) => (n + 1) % faqs.length)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
