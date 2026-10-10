import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/quote', label: 'Instant quote' },
  { to: '/about', label: 'About' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="layout">
      <header className="nav">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <strong>MIKE'S BIKES</strong>
          <span>Transportation Services</span>
        </Link>
        <button
          className="icon-btn nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <nav id="site-nav" className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                My garage
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>
                  Admin
                </NavLink>
              )}
              {(user.role === 'driver' || user.role === 'admin') && (
                <NavLink to="/driver" onClick={() => setOpen(false)}>
                  Driver
                </NavLink>
              )}
              <button
                className="linkish"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Log in
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>
                Join
              </NavLink>
            </>
          )}
          <button className="icon-btn" onClick={toggle} aria-label="Toggle color theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </header>
      <Outlet />
      <footer className="footer">
        <div className="checkered footer-top" aria-hidden="true" />
        <div className="footer-body">
          <div>
            <strong>Mike's Bikes Transportation Services</strong>
            <p className="muted">Emergency + scheduled · Pickup / drop-off in Atlanta</p>
            <p className="script">
              We'll come <em>get you</em>
            </p>
          </div>
          <div>
            <p>
              <a href="tel:2674046453">267-404-MIKE (6453)</a>
            </p>
            <p className="muted">Safe · Reliable · Fast response · All bikes welcome</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
