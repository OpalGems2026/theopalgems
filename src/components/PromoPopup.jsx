import React, { useState, useEffect, useCallback, useRef } from 'react';

// 10%-off welcome popup. Appears once per visitor (after a short delay or a bit
// of scrolling), collects name + email + phone, subscribes them via /api/subscribe,
// and reveals the promo code. Dismissals + successful signups are remembered in
// localStorage so we never nag a returning visitor.

const STORAGE_KEY = 'og_promo_popup';           // { dismissedAt, subscribed }
const DISMISS_COOLDOWN_DAYS = 30;               // re-show this long after a dismissal
const SHOW_DELAY_MS = 12000;                    // show after 12s idle on the page
const SCROLL_TRIGGER = 0.35;                    // ...or once 35% scrolled

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeState(patch) {
  try {
    const next = { ...readState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function shouldSuppress() {
  const { subscribed, dismissedAt } = readState();
  if (subscribed) return true;
  if (dismissedAt) {
    const ageMs = Date.now() - dismissedAt;
    if (ageMs < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return true;
  }
  return false;
}

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', honeypot: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [promoCode, setPromoCode] = useState('');
  const [copied, setCopied] = useState(false);
  const nameRef = useRef(null);

  // Decide whether/when to open.
  useEffect(() => {
    if (shouldSuppress()) return;
    let opened = false;
    const openOnce = () => {
      if (opened || shouldSuppress()) return;
      opened = true;
      setOpen(true);
    };
    const timer = setTimeout(openOnce, SHOW_DELAY_MS);
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (scrolled >= SCROLL_TRIGGER) openOnce();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Only record a dismissal cooldown if they didn't subscribe.
    if (status.state !== 'success') writeState({ dismissedAt: Date.now() });
  }, [status.state]);

  // Focus the first field + wire Escape to close when open.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => nameRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open, close]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (!name || !email || !phone) return;
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, honeypot: form.honeypot, source: 'promo-popup' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ state: 'error', message: data.error || 'Something went wrong. Please try again.' });
        return;
      }
      setPromoCode(data.promoCode || '');
      setStatus({ state: 'success', message: data.message || 'Check your inbox to confirm.' });
      writeState({ subscribed: true });
    } catch {
      setStatus({ state: 'error', message: 'Network error. Please try again.' });
    }
  };

  const copyCode = async () => {
    if (!promoCode) return;
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable; the code is visible on screen anyway */
    }
  };

  if (!open) return null;

  const loading = status.state === 'loading';
  const success = status.state === 'success';

  return (
    <div className="promo-popup__overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="promo-popup" role="dialog" aria-modal="true" aria-labelledby="promo-popup-title">
        <button className="promo-popup__close" onClick={close} aria-label="Close">×</button>

        {!success ? (
          <>
            <p className="promo-popup__eyebrow">Welcome offer</p>
            <h2 className="promo-popup__title" id="promo-popup-title">Enjoy 10% off your next purchase</h2>
            <p className="promo-popup__subtitle">
              Join our list for new arrivals and private styling events. Enter your details and we'll send your 10% code.
            </p>
            <form className="promo-popup__form" onSubmit={handleSubmit}>
              <input
                ref={nameRef}
                type="text"
                required
                placeholder="Your name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
              <input
                type="email"
                required
                placeholder="Your email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
              />
              <input
                type="tel"
                required
                placeholder="Your phone"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
              />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.honeypot}
                onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
              />
              {status.state === 'error' && (
                <p className="promo-popup__error" role="alert">{status.message}</p>
              )}
              <button type="submit" className="pill primary promo-popup__submit" disabled={loading}>
                {loading ? 'Sending…' : 'Get my 10% code'}
              </button>
              <button type="button" className="promo-popup__decline" onClick={close}>
                No thanks
              </button>
            </form>
          </>
        ) : (
          <div className="promo-popup__success">
            <p className="promo-popup__eyebrow">You're in ✨</p>
            <h2 className="promo-popup__title">Here's your 10% code</h2>
            {promoCode && (
              <button type="button" className="promo-popup__code" onClick={copyCode} title="Click to copy">
                {promoCode}
                <span className="promo-popup__code-hint">{copied ? 'Copied!' : 'Tap to copy'}</span>
              </button>
            )}
            <p className="promo-popup__subtitle">
              Show this code at any Opal Gems boutique for 10% off your next purchase. {status.message}
            </p>
            <button type="button" className="pill primary promo-popup__submit" onClick={close}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
