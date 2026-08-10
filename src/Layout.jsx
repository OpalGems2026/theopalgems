import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getPublicLocations, getPublicSections } from './lib/publicData';
import PromoPopup from './components/PromoPopup';

// Shown in the footer "Our Boutiques" list only (not a full boutique with
// inventory / nav dropdown / location page). Address per opalcollection.com.
const OLDE_NAPLES = {
  key: 'olde-naples-hotel',
  name: 'Olde Naples Hotel',
  address: '200 Broad Avenue South, Naples, FL 34102',
};

// One shared phone number for all boutiques.
const BOUTIQUE_PHONE = '(920) 920-1145';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribePhone, setSubscribePhone] = useState('');
  const [subscribeHoneypot, setSubscribeHoneypot] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ state: 'idle', message: '', promoCode: '' });
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const name = subscribeName.trim();
    const email = subscribeEmail.trim();
    const phone = subscribePhone.trim();
    if (!name || !email || !phone) return;
    setSubscribeStatus({ state: 'loading', message: '', promoCode: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, honeypot: subscribeHoneypot, source: 'website-footer' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubscribeStatus({ state: 'error', message: data.error || 'Something went wrong. Please try again.', promoCode: '' });
        return;
      }
      setSubscribeStatus({
        state: 'success',
        message: data.message || 'Please check your inbox to confirm.',
        promoCode: data.promoCode || '',
      });
      setSubscribeName('');
      setSubscribeEmail('');
      setSubscribePhone('');
    } catch (err) {
      setSubscribeStatus({ state: 'error', message: 'Network error. Please try again.', promoCode: '' });
    }
  };

  useEffect(() => {
    getPublicLocations().then(locs => setLocations(locs.map(loc => ({
      key: loc.key, name: loc.name, city: loc.city, address: loc.address, phone: loc.phone,
    }))));
    getPublicSections().then(s => setReviews(s.reviews)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleHashLink = (e, sectionId) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="topbar" role="banner">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`nav nav--left ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Watches'].map((cat) => (
            <div key={cat} className="nav-dropdown">
              <Link to={`/category/${cat.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}>{cat}</Link>
              <div className="nav-dropdown__menu">
                {locations.map((loc) => (
                  <Link key={loc.key} to={`/location/${loc.key}/${cat.toLowerCase()}`} className="nav-dropdown__item" onClick={() => setMobileMenuOpen(false)}>
                    {loc.name}
                    <span>{loc.city}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {/* Mobile-only links */}
          <div className="mobile-nav-extras">
            <a href="/#locations" onClick={(e) => { setMobileMenuOpen(false); handleHashLink(e, 'locations'); }}>Locations</a>
            <Link to="/book" onClick={() => setMobileMenuOpen(false)}>Book Appointment</Link>
          </div>
        </nav>

        <Link to="/" className="logo">Opal Gems</Link>

        <div className="topbar__right">
          {/* Search */}
          <button className="search-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <a href="/#locations" className="nav-link desktop-only" onClick={(e) => handleHashLink(e, 'locations')}>Locations</a>
          <Link to="/book" className="pill primary desktop-only">Book Appointment</Link>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="search-overlay">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="submit">Search</button>
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>×</button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer__main">
          {/* Brand Column */}
          <div className="footer__column footer__brand">
            <Link to="/" className="logo">Opal Gems</Link>
            <p className="footer__tagline">Elevated diamonds, in person.</p>
            <div className="footer__social">
              <a href="https://www.instagram.com/theopalgems" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src="/assets/logos/Instagram_Glyph_Gradient.png" alt="Instagram" width="24" height="24" style={{ display: 'block' }} />
              </a>
            </div>
            {reviews && (
              <div className="footer__reviews reviews-rating">
                <span className="reviews-stars">★★★★★</span>
                <span className="reviews-score">{reviews.score}</span>
                <span className="reviews-count">{reviews.count}</span>
              </div>
            )}
          </div>

          {/* Locations Column */}
          <div className="footer__column">
            <h4>Our Boutiques</h4>
            {[...locations, OLDE_NAPLES].map((loc) => (
              <div key={loc.key} className="footer__location">
                <strong>{loc.name}</strong>
                <span>{loc.address}</span>
              </div>
            ))}
            <div className="footer__location">
              <strong>Various Locations</strong>
              <span>1 simple call</span>
              <a href={`tel:${BOUTIQUE_PHONE.replace(/[^0-9]/g, '')}`}>{BOUTIQUE_PHONE}</a>
            </div>
          </div>

          {/* Hours Column */}
          <div className="footer__column">
            <h4>Hours</h4>
            <div className="footer__hours">
              <p><strong>Monday - Saturday</strong><br />10:00 AM - 7:00 PM</p>
              <p><strong>Sunday</strong><br />11:00 AM - 5:00 PM</p>
              <p className="small">Hours may vary by location and season.</p>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer__column">
            <h4>Quick Links</h4>
            <nav className="footer__nav">
              <Link to="/about" onClick={() => window.scrollTo(0, 0)}>About Us</Link>
              <Link to="/craft" onClick={() => window.scrollTo(0, 0)}>Craft Your Diamond</Link>
              <a href="/#locations" onClick={(e) => handleHashLink(e, 'locations')}>Locations</a>
              <Link to="/lab-vs-natural" onClick={() => window.scrollTo(0, 0)}>Lab vs. Natural</Link>
              <Link to="/faq" onClick={() => window.scrollTo(0, 0)}>FAQ</Link>
              <a href="https://opal-gems.vercel.app/customers" target="_blank" rel="noopener noreferrer">Register Customer</a>
            </nav>
          </div>

          {/* Subscribe & Contact Column */}
          <div className="footer__column footer__newsletter">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Subscribe Box */}
              <div>
                <h4>Stay Sparkling</h4>
                <p className="small" style={{ marginBottom: '12px' }}>Join our exclusive list for new arrivals and special offers — and get 10% off your next purchase.</p>
                <form className="newsletter-form" onSubmit={handleSubscribe}>
                  <input
                    type="text"
                    name="name"
                    required
                    value={subscribeName}
                    onChange={(e) => setSubscribeName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    disabled={subscribeStatus.state === 'loading'}
                    className="newsletter-form__input"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Your email"
                    autoComplete="email"
                    disabled={subscribeStatus.state === 'loading'}
                    className="newsletter-form__input"
                  />
                  <div className="newsletter-form__row">
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={subscribePhone}
                      onChange={(e) => setSubscribePhone(e.target.value)}
                      placeholder="Your phone"
                      autoComplete="tel"
                      disabled={subscribeStatus.state === 'loading'}
                      className="newsletter-form__input"
                    />
                    <button
                      type="submit"
                      className="pill primary"
                      disabled={subscribeStatus.state === 'loading'}
                      style={{ padding: '10px 20px', fontSize: '14px', whiteSpace: 'nowrap', opacity: subscribeStatus.state === 'loading' ? 0.6 : 1 }}
                    >
                      {subscribeStatus.state === 'loading' ? '...' : 'Subscribe'}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={subscribeHoneypot}
                    onChange={(e) => setSubscribeHoneypot(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, zIndex: -1 }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                </form>

                {subscribeStatus.state === 'success' && (
                  <div style={{ marginTop: '10px' }} role="status">
                    <p className="small" style={{ color: 'var(--accent)', margin: 0 }}>✓ {subscribeStatus.message}</p>
                    {subscribeStatus.promoCode && (
                      <p className="small" style={{ marginTop: '6px' }}>
                        Your 10% code: <strong style={{ letterSpacing: '0.1em' }}>{subscribeStatus.promoCode}</strong>
                      </p>
                    )}
                  </div>
                )}
                {subscribeStatus.state === 'error' && (
                  <p className="small" style={{ marginTop: '10px', color: '#c0392b' }} role="alert">
                    {subscribeStatus.message}
                  </p>
                )}
              </div>

              {/* Contact Us */}
              <div>
                <h4>Contact Us</h4>
                <p className="small">Text us on WhatsApp for immediate assistance.</p>
                <a href="https://wa.me/+15612519560" target="_blank" rel="noopener noreferrer" className="pill whatsapp" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/logos/Digital_Glyph_Green_RGB_2026.png" alt="WhatsApp" width="24" height="24" style={{ marginRight: '8px', display: 'block' }} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="small">© {new Date().getFullYear()} Opal Gems. All rights reserved.</div>
          <div className="footer__legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>

      <PromoPopup />
    </>
  );
}
