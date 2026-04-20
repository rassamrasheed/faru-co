import { useState, useMemo, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, updateDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  Waves, Fish, Anchor, Sun, Heart, Sparkles, MapPin,
  Plus, Minus, Check, Wind, Flower2, Camera, Utensils, Music,
  Compass, ArrowRight, ArrowLeft, X, AlertCircle, Shuffle, Plane,
  RotateCcw, Zap,
} from 'lucide-react';

/* ========== THEME ========== */
const C = {
  navy:        '#0c3441',
  teal:        '#2a9d8f',
  copper:      '#c97b4e',
  coral:       '#f4845f',
  gold:        '#f9c23c',
  sand:        '#fff9f0',
  cream:       '#fef3d8',
  seafoam:     '#d8f0ec',
  ltTeal:      '#7fb5ae',
  tan:         '#d4a574',
  brown:       '#8b5a3c',
  textDark:    '#1a2e35',
  textMid:     '#5a5348',
  textLight:   '#7a6f5e',
  border:      'rgba(12,52,65,0.12)',
  borderFaint: 'rgba(12,52,65,0.07)',
  warn:        '#fff3e0',
  warnText:    '#8a5a2b',
  error:       '#e53e3e',
};

const ISLAND_COLORS = [C.navy, C.teal, C.coral, C.ltTeal, C.tan, C.brown];

/* ========== DATA ========== */

const PACKAGES = [
  {
    id: 'local',
    name: 'Local Island',
    tagline: 'Live like a Maldivian',
    description: 'Family-run guesthouses on real, breathing islands. Authentic food, warm people, and zero pretension.',
    basePerNight: 80,
  },
  {
    id: 'resort',
    name: 'Private Resort',
    tagline: 'Your own slice of paradise',
    description: 'One island. One resort. Overwater villas, sunrise yoga, and a butler who knows your name.',
    basePerNight: 520,
  },
];

const ISLANDS = {
  local: [
    { id: 'maafushi',   name: 'Maafushi',   atoll: 'Kaafu Atoll', zone: 'north-male', note: 'The classic first-timer favorite',  tags: ['Beaches', 'Snorkeling'] },
    { id: 'hulhumale',  name: 'Hulhumalé',  atoll: 'Kaafu Atoll', zone: 'north-male', note: '5 min from the airport',             tags: ['Convenient'] },
    { id: 'thulusdhoo', name: 'Thulusdhoo', atoll: 'Kaafu Atoll', zone: 'north-male', note: 'Home of the legendary Cokes break',  tags: ['Surf'] },
    { id: 'fulidhoo',   name: 'Fulidhoo',   atoll: 'Vaavu Atoll', zone: 'vaavu',      note: 'Nurse sharks sleep at the jetty',    tags: ['Quiet', 'Sharks'] },
    { id: 'dhigurah',   name: 'Dhigurah',   atoll: 'Ari Atoll',   zone: 'ari',        note: 'Whale sharks every single day',      tags: ['Whale Sharks'] },
    { id: 'rasdhoo',    name: 'Rasdhoo',    atoll: 'Ari Atoll',   zone: 'ari',        note: 'Hammerheads at dawn — seriously',    tags: ['Diving'] },
  ],
  resort: [
    { id: 'baa',        name: 'Baa Atoll',   atoll: 'UNESCO Biosphere', zone: 'baa',        note: 'Hanifaru Bay manta vortex',    tags: ['Mantas', 'UNESCO'] },
    { id: 'south-ari',  name: 'South Ari',   atoll: 'Ari Atoll',        zone: 'ari',        note: 'Whale shark sanctuary all year', tags: ['Whale Sharks'] },
    { id: 'north-male', name: 'North Malé',  atoll: 'Kaafu Atoll',      zone: 'north-male', note: '20-min speedboat from airport',  tags: ['Accessible'] },
    { id: 'lhaviyani',  name: 'Lhaviyani',   atoll: 'Northern Atolls',  zone: 'lhaviyani',  note: 'Overwater villas, zero crowds',  tags: ['Secluded'] },
    { id: 'raa',        name: 'Raa Atoll',   atoll: 'Raa Atoll',        zone: 'raa',        note: 'House reefs untouched by time',  tags: ['Remote'] },
    { id: 'noonu',      name: 'Noonu Atoll', atoll: 'Noonu Atoll',      zone: 'noonu',      note: 'Seaplane-only. Gloriously remote', tags: ['Luxury'] },
  ],
};

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ACTIVITIES = [
  { id: 'snorkel',    name: 'Snorkeling Trip',      icon: Fish,     price: 35,  duration: '3 hours',  availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'dive',       name: 'Scuba Diving',         icon: Anchor,   price: 110, duration: '4 hours',  availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'whaleshark', name: 'Whale Shark Safari',   icon: Waves,    price: 120, duration: 'Full day', availableAt: ['dhigurah', 'south-ari'],              activeMonths: ALL_MONTHS },
  { id: 'manta',      name: 'Manta Ray Snorkel',    icon: Sparkles, price: 85,  duration: 'Half day', availableAt: ['baa', 'south-ari', 'rasdhoo'],        activeMonths: [5, 6, 7, 8, 9, 10, 11] },
  { id: 'sunset',     name: 'Sunset Fishing',       icon: Sun,      price: 45,  duration: '3 hours',  availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'dolphin',    name: 'Dolphin Cruise',       icon: Heart,    price: 40,  duration: '2 hours',  availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'sandbank',   name: 'Sandbank Picnic',      icon: Wind,     price: 75,  duration: 'Half day', availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'spa',        name: 'Traditional Spa',      icon: Flower2,  price: 95,  duration: '90 min',   availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'surf',       name: 'Surf Lesson',          icon: Compass,  price: 60,  duration: '2 hours',  availableAt: ['thulusdhoo', 'north-male'],           activeMonths: [3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 'photo',      name: 'Photography Tour',     icon: Camera,   price: 150, duration: 'Full day', availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'dinner',     name: 'Private Beach Dinner', icon: Utensils, price: 85,  duration: 'Evening',  availableAt: '*',                                   activeMonths: ALL_MONTHS },
  { id: 'boduberu',   name: 'Bodu Beru Show',       icon: Music,    price: 30,  duration: 'Evening',  availableAt: ['maafushi', 'fulidhoo', 'thulusdhoo'], activeMonths: ALL_MONTHS },
];

const MONTHS = [
  { n: 1,  name: 'January',   short: 'Jan', season: 'dry' },
  { n: 2,  name: 'February',  short: 'Feb', season: 'dry' },
  { n: 3,  name: 'March',     short: 'Mar', season: 'dry' },
  { n: 4,  name: 'April',     short: 'Apr', season: 'dry' },
  { n: 5,  name: 'May',       short: 'May', season: 'wet' },
  { n: 6,  name: 'June',      short: 'Jun', season: 'wet' },
  { n: 7,  name: 'July',      short: 'Jul', season: 'wet' },
  { n: 8,  name: 'August',    short: 'Aug', season: 'wet' },
  { n: 9,  name: 'September', short: 'Sep', season: 'wet' },
  { n: 10, name: 'October',   short: 'Oct', season: 'wet' },
  { n: 11, name: 'November',  short: 'Nov', season: 'dry' },
  { n: 12, name: 'December',  short: 'Dec', season: 'dry' },
];

const STEPS = [
  { n: 1, label: 'Style' },
  { n: 2, label: 'Dates' },
  { n: 3, label: 'Islands' },
  { n: 4, label: 'Itinerary' },
  { n: 5, label: 'Experiences' },
];

/* ========== FEATURED PACKAGES ========== */
const FEATURED = [
  {
    id: 'honeymoon',
    emoji: '🌅',
    name: 'Honeymoon Escape',
    tagline: 'For the chapter that changes everything.',
    badge: 'Most popular',
    badgeColor: C.coral,
    nights: 7,
    guests: 2,
    packageType: 'resort',
    islands: ['baa', 'south-ari'],
    month: 2,
    image: '/images/honeymoon.png',
    accentColor: C.copper,
    highlights: ['7 nights', 'Private resort', '2 atolls'],
  },
  {
    id: 'adventure',
    emoji: '🦈',
    name: 'Wild Blue Adventure',
    tagline: "Whale sharks won't find themselves.",
    badge: 'Best for divers',
    badgeColor: C.teal,
    nights: 10,
    guests: 2,
    packageType: 'local',
    islands: ['dhigurah', 'rasdhoo', 'maafushi'],
    month: 6,
    image: '/images/adventure.png',
    accentColor: C.teal,
    highlights: ['10 nights', 'Local islands', '3 atolls'],
  },
  {
    id: 'family',
    emoji: '🐠',
    name: 'Family Paradise',
    tagline: "The trip they'll talk about forever.",
    badge: 'Family friendly',
    badgeColor: '#6c9e4f',
    nights: 8,
    guests: 4,
    packageType: 'local',
    islands: ['maafushi', 'hulhumale'],
    month: 1,
    image: '/images/family.png',
    accentColor: '#b8962e',
    highlights: ['8 nights', 'Local islands', '4 guests'],
  },
  {
    id: 'surf',
    emoji: '🏄',
    name: 'Surf & Soul',
    tagline: 'Just you, the board, and perfect left-handers.',
    badge: 'Solo escape',
    badgeColor: '#7a5af8',
    nights: 5,
    guests: 1,
    packageType: 'local',
    islands: ['thulusdhoo'],
    month: 5,
    image: '/images/surf.png',
    accentColor: '#7a5af8',
    highlights: ['5 nights', 'Local island', 'Solo'],
  },
];

const GST_RATE = 0.16;
const STORAGE_KEY = 'faru_trip_v2';

const ISLAND_IMAGES = {
  maafushi:    '/images/local-island.png',
  hulhumale:   '/images/family.png',
  thulusdhoo:  '/images/surf.png',
  fulidhoo:    '/images/local-island.png',
  dhigurah:    '/images/adventure.png',
  rasdhoo:     '/images/adventure.png',
  baa:         '/images/honeymoon.png',
  'south-ari': '/images/private-resort.png',
  'north-male':'/images/private-resort.png',
  lhaviyani:   '/images/honeymoon.png',
  raa:         '/images/local-island.png',
  noonu:       '/images/private-resort.png',
};

const ARTICLES = [
  {
    id: 1,
    category: 'Honeymoon',
    title: 'The Perfect Maldives Honeymoon: A Complete Guide',
    excerpt: 'From choosing between overwater bungalows and beach villas to timing your trip for the best weather — everything you need to plan the most romantic escape of your life.',
    image: '/images/honeymoon.png',
    date: 'March 2025',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 2,
    category: 'Insider Tips',
    title: 'Local Islands vs. Private Resorts: An Honest Breakdown',
    excerpt: "Budget vs. bliss? It's not that simple. Here's a real, unfiltered look at what each experience delivers — and who each one is really for.",
    image: '/images/local-island.png',
    date: 'February 2025',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 3,
    category: 'Marine Life',
    title: "Swimming with Whale Sharks: What Nobody Tells You",
    excerpt: "The briefing says stay 3 meters away. Then a 9-meter shark swims straight at you. Here's what it's actually like — and how to be ready for it.",
    image: '/images/adventure.png',
    date: 'January 2025',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 4,
    category: 'Family Travel',
    title: "The Maldives With Kids: It's Way Easier Than You Think",
    excerpt: "Most families write off the Maldives as 'too expensive' or 'too remote.' We've got news: with the right islands and a smart itinerary, it's one of the best family trips on earth.",
    image: '/images/family.png',
    date: 'December 2024',
    readTime: '7 min read',
    featured: false,
  },
];

/* ========== HELPERS ========== */

const isActivityAvailableAt = (activity, islandId) =>
  activity.availableAt === '*' || activity.availableAt.includes(islandId);

const isActivityInSeason = (activity, month) =>
  !month || activity.activeMonths.includes(month);

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function generateRef() {
  return 'FARU-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ========== TOAST ========== */

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm px-4"
      role="region" aria-live="polite"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-white text-sm font-medium shadow-xl pointer-events-auto w-full"
          style={{ background: C.navy }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-60 hover:opacity-100" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ========== BOOKING MODAL ========== */

function BookingModal({ isOpen, onClose, summary, tripData }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const bookingRef = useRef(generateRef()).current;

  useEffect(() => {
    if (!isOpen) {
      setForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
      setErrors({});
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Required';
    return errs;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ref: bookingRef,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        packageType: tripData?.packageType ?? null,
        packageName: summary.title,
        nights: tripData?.nights ?? null,
        guests: tripData?.guests ?? null,
        travelMonth: tripData?.travelMonth ?? null,
        monthName: tripData?.monthName ?? null,
        islands: tripData?.selectedIslands ?? [],
        islandNames: tripData?.islandNames ?? '',
        nightsPerIsland: tripData?.nightsPerIsland ?? {},
        activityQty: tripData?.activityQty ?? {},
        subtotal: summary.subtotal,
        gst: summary.gst,
        total: summary.totalWithGst,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch {}
  };

  const setField = (field) => (evt) => {
    setForm(f => ({ ...f, [field]: evt.target.value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? C.error : C.border,
    color: C.navy,
    outline: 'none',
    fontFamily: 'inherit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(12,52,65,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'white' }}>
        <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: C.coral }}>
              Almost there ✦
            </div>
            <h2 id="modal-title" className="font-display text-2xl mt-0.5" style={{ color: C.navy }}>
              Let's make this real
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Close">
            <X className="w-4 h-4" style={{ color: C.textMid }} />
          </button>
        </div>

        <div className="px-8 py-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🌴</div>
              <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>You're on your way!</h3>
              <p className="text-sm mb-5" style={{ color: C.textMid }}>
                We'll confirm your trip and send a final quote within 24 hours. Get excited — this is going to be amazing.
              </p>
              <div className="inline-block px-5 py-2.5 rounded-full text-sm font-medium mb-4" style={{ background: C.cream, color: C.navy }}>
                Reference: <span className="font-display text-base">{bookingRef}</span>
              </div>
              <p className="text-xs" style={{ color: C.textLight }}>Keep this reference for all future correspondence.</p>
              <button onClick={onClose} className="mt-6 px-8 py-3 rounded-full text-white text-sm font-semibold block mx-auto transition-transform hover:scale-105" style={{ background: C.navy }}>
                Back to my trip
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: C.sand }}>
                <div className="font-semibold mb-1" style={{ color: C.navy }}>{summary.title}</div>
                <div className="text-xs mb-2" style={{ color: C.textLight }}>{summary.detail}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-xl" style={{ color: C.navy }}>${summary.totalWithGst.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: C.textLight }}>incl. 16% GST</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[['firstName', 'First name', 'Amira', 'given-name'], ['lastName', 'Last name', 'Hassan', 'family-name']].map(([f, label, ph, ac]) => (
                    <div key={f}>
                      <label htmlFor={f} className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                      <input id={f} value={form[f]} onChange={setField(f)} className="w-full px-4 py-2.5 rounded-xl border text-sm" style={inputStyle(f)} placeholder={ph} autoComplete={ac} />
                      {errors[f] && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors[f]}</p>}
                    </div>
                  ))}
                </div>

                {[['email', 'Email address', 'you@example.com', 'email', 'email'], ['phone', 'Phone / WhatsApp', '+1 234 567 8900', 'tel', 'tel']].map(([f, label, ph, type, ac]) => (
                  <div key={f} className="mb-4">
                    <label htmlFor={f} className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                    <input id={f} type={type} value={form[f]} onChange={setField(f)} className="w-full px-4 py-2.5 rounded-xl border text-sm" style={inputStyle(f)} placeholder={ph} autoComplete={ac} />
                    {errors[f] && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors[f]}</p>}
                  </div>
                ))}

                <div className="mb-6">
                  <label htmlFor="notes" className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>
                    Special requests <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea id="notes" value={form.notes} onChange={setField('notes')} className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none" style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} rows={3} placeholder="Anniversary, dietary needs, accessibility..." />
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                  Send my booking request <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <p className="text-xs text-center mt-3" style={{ color: C.textLight }}>
                  No payment now. We confirm availability and send a final quote within 24 hours.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== FEATURED PACKAGE CARD ========== */

function FeaturedCard({ pkg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group w-full"
      style={{ boxShadow: '0 4px 20px rgba(12,52,65,0.10)' }}
      aria-label={`Start ${pkg.name} package`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,52,65,0.7) 0%, rgba(12,52,65,0.1) 60%, transparent 100%)' }} />
        {/* Badge */}
        <span
          className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full text-white"
          style={{ background: pkg.badgeColor }}
        >
          {pkg.badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-5" style={{ background: 'white' }}>
        <h3 className="font-display text-lg leading-tight mb-1" style={{ color: C.navy }}>
          {pkg.name}
        </h3>
        <p className="text-xs leading-snug mb-3" style={{ color: C.textMid }}>
          {pkg.tagline}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pkg.highlights.map(h => (
            <span
              key={h}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: C.sand, color: pkg.accentColor }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
          style={{ color: pkg.accentColor }}
        >
          Start this trip
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

/* ========== ADMIN PAGE ========== */

const STATUS_COLORS = {
  new:       { bg: '#fff3e0', color: '#8a5a2b' },
  contacted: { bg: '#d8f0ec', color: '#2a9d8f' },
  confirmed: { bg: '#e8f5e9', color: '#2e7d32' },
  declined:  { bg: '#fce4ec', color: '#c62828' },
  read:      { bg: '#d8f0ec', color: '#2a9d8f' },
  replied:   { bg: '#e8f5e9', color: '#2e7d32' },
};

function AdminPage() {
  const [authUser, setAuthUser]       = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail]   = useState('');
  const [loginPw, setLoginPw]         = useState('');
  const [loginErr, setLoginErr]       = useState('');
  const [loginBusy, setLoginBusy]     = useState(false);
  const [tab, setTab]                 = useState('bookings');
  const [bookings, setBookings]       = useState([]);
  const [contacts, setContacts]       = useState([]);
  const [expanded, setExpanded]       = useState(null);

  useEffect(() => onAuthStateChanged(auth, u => { setAuthUser(u); setAuthChecked(true); }), []);

  useEffect(() => {
    if (!authUser) return;
    const u1 = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')),
      s => setContacts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, [authUser]);

  const login = async e => {
    e.preventDefault();
    setLoginBusy(true); setLoginErr('');
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPw); }
    catch { setLoginErr('Invalid email or password.'); }
    finally { setLoginBusy(false); }
  };

  const setStatus = async (collName, id, status) => {
    try { await updateDoc(doc(db, collName, id), { status }); } catch {}
  };

  const formatDate = ts => ts?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.sand }}>
      <div className="text-sm" style={{ color: C.textLight }}>Loading…</div>
    </div>
  );

  if (!authUser) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md" style={{ background: C.navy }}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div className="font-display text-2xl" style={{ color: C.navy }}>Admin Panel</div>
          <div className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: C.textLight }}>Faru & Co</div>
        </div>
        <form onSubmit={login} className="rounded-3xl p-8" style={{ background: 'white', boxShadow: '0 4px 24px rgba(12,52,65,0.10)' }}>
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Email</label>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
              placeholder="admin@faru.co" autoComplete="email" />
          </div>
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Password</label>
            <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border text-sm" style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {loginErr && <p className="text-xs mb-4 text-center" style={{ color: C.error }}>{loginErr}</p>}
          <button type="submit" disabled={loginBusy}
            className="w-full py-3 rounded-2xl text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
            style={{ background: C.navy }}>
            {loginBusy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );

  const newBookings = bookings.filter(b => b.status === 'new').length;
  const newContacts = contacts.filter(c => c.status === 'new').length;
  const confirmedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.total || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>
      {/* Admin Header */}
      <div className="border-b sticky top-0 z-30" style={{ background: 'white', borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.navy }}>
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-lg leading-none" style={{ color: C.navy }}>Faru & Co</div>
              <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.coral }}>Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs hidden sm:block" style={{ color: C.textLight }}>{authUser.email}</span>
            <button onClick={() => signOut(auth)}
              className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: C.border, color: C.textMid }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Requests',  value: bookings.length,                                    sub: `${newBookings} new`,          color: C.navy  },
            { label: 'New Requests',    value: newBookings,                                         sub: 'awaiting response',           color: C.coral },
            { label: 'Confirmed',       value: bookings.filter(b => b.status === 'confirmed').length, sub: `$${confirmedRevenue.toLocaleString()} revenue`, color: C.teal  },
            { label: 'Messages',        value: contacts.length,                                    sub: `${newContacts} unread`,        color: C.copper},
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: 'white', border: `1px solid ${C.border}` }}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: C.textLight }}>{s.label}</div>
              <div className="font-display text-3xl mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: C.textLight }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[['bookings', 'Booking Requests', newBookings], ['contacts', 'Messages', newContacts]].map(([t, label, badge]) => (
            <button key={t} onClick={() => { setTab(t); setExpanded(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{ background: tab === t ? C.navy : 'white', color: tab === t ? 'white' : C.textMid, border: `1.5px solid ${tab === t ? C.navy : C.border}` }}>
              {label} ({tab === t ? (t === 'bookings' ? bookings.length : contacts.length) : (t === 'bookings' ? bookings.length : contacts.length)})
              {badge > 0 && <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: C.coral, color: 'white' }}>{badge}</span>}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm" style={{ color: C.textLight }}>No booking requests yet.</p>
              </div>
            )}
            {bookings.map(b => {
              const exp = expanded === b.id;
              const sc  = STATUS_COLORS[b.status] ?? STATUS_COLORS.new;
              return (
                <div key={b.id} className="rounded-2xl overflow-hidden" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                    onClick={() => setExpanded(exp ? null : b.id)}>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 items-center min-w-0">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: C.navy }}>{b.firstName} {b.lastName}</div>
                        <div className="text-xs" style={{ color: C.textLight }}>{b.ref}</div>
                      </div>
                      <div className="text-xs truncate hidden md:block" style={{ color: C.textMid }}>{b.packageName?.split('·')[0]?.trim()}</div>
                      <div className="text-xs hidden md:block" style={{ color: C.textMid }}>{b.nights}n · {b.guests} guests</div>
                      <div className="font-display text-xl hidden md:block" style={{ color: C.navy }}>${(b.total || 0).toLocaleString()}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: sc.bg, color: sc.color }}>{b.status}</span>
                        <span className="text-xs" style={{ color: C.textLight }}>{exp ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {exp && (
                    <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: C.borderFaint }}>
                      <div className="grid md:grid-cols-2 gap-6 mb-5">
                        <div>
                          <div className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: C.textLight }}>Contact Details</div>
                          <div className="space-y-1 text-sm" style={{ color: C.navy }}>
                            <div className="font-semibold">{b.firstName} {b.lastName}</div>
                            <div style={{ color: C.teal }}>{b.email}</div>
                            <div>{b.phone}</div>
                            {b.notes && <div className="mt-2 p-3 rounded-xl text-xs leading-relaxed" style={{ background: C.sand, color: C.textMid }}>{b.notes}</div>}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: C.textLight }}>Trip Details</div>
                          <div className="text-sm space-y-1" style={{ color: C.navy }}>
                            <div>{b.packageName}</div>
                            <div style={{ color: C.textMid }}>{b.nights} nights · {b.guests} guest{b.guests !== 1 ? 's' : ''}</div>
                            {b.islandNames && <div style={{ color: C.textMid }}>{b.islandNames}</div>}
                            <div className="font-display text-xl mt-2">${(b.total || 0).toLocaleString()} <span className="text-xs font-sans" style={{ color: C.textLight }}>incl. GST</span></div>
                            <div className="text-xs" style={{ color: C.textLight }}>Submitted {formatDate(b.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textLight }}>Status</div>
                        <div className="flex gap-2 flex-wrap">
                          {['new', 'contacted', 'confirmed', 'declined'].map(s => {
                            const ssc = STATUS_COLORS[s];
                            const active = b.status === s;
                            return (
                              <button key={s} onClick={() => setStatus('bookings', b.id, s)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all"
                                style={{ background: active ? ssc.color : ssc.bg, color: active ? 'white' : ssc.color }}>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Contacts list */}
        {tab === 'contacts' && (
          <div className="space-y-3">
            {contacts.length === 0 && (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm" style={{ color: C.textLight }}>No messages yet.</p>
              </div>
            )}
            {contacts.map(c => {
              const exp = expanded === c.id;
              const sc  = STATUS_COLORS[c.status] ?? STATUS_COLORS.new;
              return (
                <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                    onClick={() => setExpanded(exp ? null : c.id)}>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center min-w-0">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm" style={{ color: C.navy }}>{c.firstName} {c.lastName}</div>
                        <div className="text-xs truncate" style={{ color: C.textLight }}>{c.email}</div>
                      </div>
                      <div className="text-sm truncate hidden md:block" style={{ color: C.textMid }}>{c.subject}</div>
                      <div className="text-xs hidden md:block" style={{ color: C.textLight }}>{formatDate(c.createdAt)}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                        <span className="text-xs" style={{ color: C.textLight }}>{exp ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {exp && (
                    <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: C.borderFaint }}>
                      <div className="mb-4">
                        <div className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: C.textLight }}>From</div>
                        <div className="text-sm font-semibold" style={{ color: C.navy }}>{c.firstName} {c.lastName}</div>
                        <div className="text-sm" style={{ color: C.teal }}>{c.email}</div>
                      </div>
                      <div className="mb-5">
                        <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textLight }}>Message</div>
                        <div className="p-4 rounded-2xl text-sm leading-relaxed" style={{ background: C.sand, color: C.textMid }}>{c.message}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textLight }}>Status</div>
                        <div className="flex gap-2">
                          {['new', 'read', 'replied'].map(s => {
                            const ssc = STATUS_COLORS[s];
                            const active = c.status === s;
                            return (
                              <button key={s} onClick={() => setStatus('contacts', c.id, s)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all"
                                style={{ background: active ? ssc.color : ssc.bg, color: active ? 'white' : ssc.color }}>
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== DESTINATIONS PAGE ========== */

function DestinationsPage({ onPlanTrip }) {
  const [filter, setFilter] = useState('all');
  const allIslands = [...ISLANDS.local.map(i => ({ ...i, type: 'local' })), ...ISLANDS.resort.map(i => ({ ...i, type: 'resort' }))];
  const shown = filter === 'all' ? allIslands : allIslands.filter(i => i.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1.5 rounded-full" style={{ background: C.gold + '33', color: '#9a6f00' }}>
          <MapPin className="w-3 h-3" /> 1,192 islands · your shortlist
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4" style={{ color: C.navy }}>
          Every island is<br /><span className="font-display-italic" style={{ color: C.teal }}>a different world.</span>
        </h1>
        <p className="text-base max-w-lg" style={{ color: C.textMid }}>
          Volcanic atolls, sandbanks that disappear at high tide, nurse sharks sleeping at jetties. Pick the ones that match how you travel.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8">
        {[['all', 'All Islands'], ['local', 'Local Islands'], ['resort', 'Private Resorts']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{ background: filter === val ? C.navy : 'white', color: filter === val ? 'white' : C.textMid, border: `1.5px solid ${filter === val ? C.navy : C.border}` }}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map(island => (
          <div key={island.id} className="rounded-3xl overflow-hidden group" style={{ background: 'white', boxShadow: '0 4px 20px rgba(12,52,65,0.08)' }}>
            <div className="relative h-48 overflow-hidden">
              <img src={ISLAND_IMAGES[island.id]} alt={island.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,52,65,0.6) 0%, transparent 60%)' }} />
              <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full text-white"
                style={{ background: island.type === 'local' ? C.teal : C.copper }}>
                {island.type === 'local' ? 'Local Island' : 'Resort Atoll'}
              </span>
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/70 mb-0.5">{island.atoll}</div>
                <div className="font-display text-xl text-white leading-tight">{island.name}</div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm mb-3 leading-relaxed" style={{ color: C.textMid }}>{island.note}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {island.tags.map(tag => (
                  <span key={tag} className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-medium" style={{ background: C.sand, color: C.textMid }}>{tag}</span>
                ))}
              </div>
              <button onClick={() => onPlanTrip(island.type, island.id)}
                className="flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
                style={{ color: C.coral }}>
                Plan a trip here <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== JOURNAL PAGE ========== */

function JournalPage() {
  const [featured, ...rest] = ARTICLES;
  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1.5 rounded-full" style={{ background: C.seafoam, color: C.teal }}>
          <Sparkles className="w-3 h-3" /> Stories from the water
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4" style={{ color: C.navy }}>
          The Journal.
        </h1>
        <p className="text-base max-w-lg" style={{ color: C.textMid }}>
          Real stories, honest guides, and the kind of insider knowledge you only get from people who actually live here.
        </p>
      </div>

      {/* Featured article */}
      <div className="rounded-3xl overflow-hidden mb-8 group cursor-pointer" style={{ background: 'white', boxShadow: '0 4px 32px rgba(12,52,65,0.10)' }}>
        <div className="grid md:grid-cols-2">
          <div className="relative h-72 md:h-auto overflow-hidden">
            <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 50%, rgba(255,255,255,0.05) 100%)' }} />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4 self-start" style={{ background: C.coral + '22', color: C.coral }}>{featured.category}</span>
            <h2 className="font-display text-3xl leading-tight mb-4" style={{ color: C.navy }}>{featured.title}</h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: C.textMid }}>{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: C.textLight }}>{featured.date} · {featured.readTime}</div>
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.coral }}>Read more <ArrowRight className="w-4 h-4" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Article grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {rest.map(article => (
          <div key={article.id} className="rounded-3xl overflow-hidden group cursor-pointer" style={{ background: 'white', boxShadow: '0 4px 20px rgba(12,52,65,0.08)' }}>
            <div className="relative h-48 overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full text-white" style={{ background: C.teal }}>{article.category}</span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg leading-tight mb-2" style={{ color: C.navy }}>{article.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: C.textMid }}>{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs" style={{ color: C.textLight }}>{article.date} · {article.readTime}</div>
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.coral }}>Read <ArrowRight className="w-3 h-3" /></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== CONTACT PAGE ========== */

function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const setField = f => e => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    setErrors(prev => { const n = { ...prev }; delete n[f]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.subject.trim()) errs.subject = 'Required';
    if (!form.message.trim()) errs.message = 'Required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        subject: form.subject,
        message: form.message,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch {}
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border text-sm';
  const inputStyle = f => ({ borderColor: errors[f] ? C.error : C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1.5 rounded-full" style={{ background: C.cream, color: C.copper }}>
          <Heart className="w-3 h-3" /> We love a good question
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4" style={{ color: C.navy }}>
          Let's talk<br /><span className="font-display-italic" style={{ color: C.coral }}>Maldives.</span>
        </h1>
        <p className="text-base max-w-lg" style={{ color: C.textMid }}>
          Got a question? Want us to build a custom trip? Or just want to know which island has the best reef? We're here for all of it.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Form */}
        <div className="rounded-3xl p-8 md:p-10" style={{ background: 'white', boxShadow: '0 4px 24px rgba(12,52,65,0.07)' }}>
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🌴</div>
              <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>Message received!</h3>
              <p className="text-sm" style={{ color: C.textMid }}>We'll get back to you within 24 hours. In the meantime, maybe start planning that trip...</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-3 rounded-full text-sm font-semibold" style={{ background: C.sand, color: C.navy }}>Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="font-display text-2xl mb-6" style={{ color: C.navy }}>Send us a message</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[['firstName', 'First name', 'Amira', 'given-name'], ['lastName', 'Last name', 'Hassan', 'family-name']].map(([f, label, ph, ac]) => (
                  <div key={f}>
                    <label htmlFor={`c-${f}`} className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                    <input id={`c-${f}`} value={form[f]} onChange={setField(f)} className={inputCls} style={inputStyle(f)} placeholder={ph} autoComplete={ac} />
                    {errors[f] && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors[f]}</p>}
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label htmlFor="c-email" className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Email address</label>
                <input id="c-email" type="email" value={form.email} onChange={setField('email')} className={inputCls} style={inputStyle('email')} placeholder="you@example.com" autoComplete="email" />
                {errors.email && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="c-subject" className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Subject</label>
                <input id="c-subject" value={form.subject} onChange={setField('subject')} className={inputCls} style={inputStyle('subject')} placeholder="Planning a honeymoon, question about Baa Atoll…" />
                {errors.subject && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.subject}</p>}
              </div>
              <div className="mb-6">
                <label htmlFor="c-message" className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Message</label>
                <textarea id="c-message" value={form.message} onChange={setField('message')} className={inputCls + ' resize-none'} style={inputStyle('message')} rows={5} placeholder="Tell us everything…" />
                {errors.message && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.message}</p>}
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                Send message <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {[
            { icon: MapPin, label: 'Based in', value: 'Malé, Republic of Maldives', sub: 'Open Mon – Sat, 9am – 6pm' },
            { icon: Heart, label: 'WhatsApp', value: '+960 300 0000', sub: 'Fastest way to reach us' },
            { icon: Sun, label: 'Email', value: 'hello@faru.co', sub: 'We reply within 24 hours' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'white', border: `1px solid ${C.border}` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: C.sand }}>
                <Icon className="w-4 h-4" style={{ color: C.coral }} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] mb-0.5 font-semibold" style={{ color: C.textLight }}>{label}</div>
                <div className="font-semibold text-sm" style={{ color: C.navy }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: C.textLight }}>{sub}</div>
              </div>
            </div>
          ))}

          <div className="p-5 rounded-2xl" style={{ background: C.cream }}>
            <div className="font-display text-lg mb-2" style={{ color: C.navy }}>Response time</div>
            <p className="text-sm" style={{ color: C.textMid }}>We typically reply within a few hours during business hours. For urgent trip planning, WhatsApp is your best bet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== MAIN APP ========== */

export default function App() {
  const saved = useRef(loadSavedState()).current || {};

  const [step, setStep]                       = useState(saved.step ?? 1);
  const [packageType, setPackageType]         = useState(saved.packageType ?? null);
  const [nights, setNights]                   = useState(saved.nights ?? 7);
  const [guests, setGuests]                   = useState(saved.guests ?? 2);
  const [travelMonth, setTravelMonth]         = useState(saved.travelMonth ?? null);
  const [selectedIslands, setSelectedIslands] = useState(saved.selectedIslands ?? []);
  const [nightsPerIsland, setNightsPerIsland] = useState(saved.nightsPerIsland ?? {});
  const [activityQty, setActivityQty]         = useState(saved.activityQty ?? {});
  const [toasts, setToasts]                   = useState([]);
  const [showModal, setShowModal]             = useState(false);
  const [currentPage, setCurrentPage]         = useState('home');

  const prevKey  = useRef('');
  const toastId  = useRef(0);

  /* --- Persist --- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, packageType, nights, guests, travelMonth, selectedIslands, nightsPerIsland, activityQty }));
    } catch {}
  }, [step, packageType, nights, guests, travelMonth, selectedIslands, nightsPerIsland, activityQty]);

  /* --- Derived --- */
  const islandById = useMemo(() => {
    const map = {};
    [...ISLANDS.local, ...ISLANDS.resort].forEach(i => { map[i.id] = i; });
    return map;
  }, []);

  const pkg     = PACKAGES.find(p => p.id === packageType);
  const islands = packageType ? ISLANDS[packageType] : [];

  /* --- Night allocation (bug-fixed) --- */
  useEffect(() => {
    const key = selectedIslands.join(',') + '|' + nights;
    if (key === prevKey.current) return;
    prevKey.current = key;
    if (!selectedIslands.length) { setNightsPerIsland({}); return; }
    const dist = {};
    if (selectedIslands.length > nights) {
      selectedIslands.forEach((id, i) => { if (i < nights) dist[id] = 1; });
    } else {
      const base = Math.floor(nights / selectedIslands.length);
      const rem  = nights % selectedIslands.length;
      selectedIslands.forEach((id, i) => { dist[id] = base + (i < rem ? 1 : 0); });
    }
    setNightsPerIsland(dist);
  }, [selectedIslands, nights]);

  /* --- Activity cleanup with toasts --- */
  useEffect(() => {
    setActivityQty(prev => {
      const out = {}, removed = [];
      Object.entries(prev).forEach(([key, qty]) => {
        const [islandId, activityId] = key.split(':');
        if (!selectedIslands.includes(islandId)) return;
        const activity = ACTIVITIES.find(a => a.id === activityId);
        if (!activity || !isActivityAvailableAt(activity, islandId)) return;
        if (!isActivityInSeason(activity, travelMonth)) { removed.push(activity.name); return; }
        const cap = nightsPerIsland[islandId] || 0;
        const clamped = Math.min(qty, cap);
        if (clamped > 0) out[key] = clamped;
        else if (qty > 0) removed.push(activity.name);
      });
      if (removed.length) {
        const id  = ++toastId.current;
        const msg = removed.length === 1
          ? `"${removed[0]}" removed — not available this month`
          : `${removed.length} experiences removed — not available this month`;
        setTimeout(() => {
          setToasts(t => [...t, { id, message: msg }]);
          setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
        }, 0);
      }
      return out;
    });
  }, [selectedIslands, travelMonth, nightsPerIsland]);

  /* --- Costs --- */
  const stayCost       = useMemo(() => (pkg ? pkg.basePerNight * nights * guests : 0), [pkg, nights, guests]);
  const transferCost   = useMemo(() => {
    if (selectedIslands.length <= 1) return 0;
    return (selectedIslands.length - 1) * (packageType === 'resort' ? 180 : 45) * guests;
  }, [selectedIslands, packageType, guests]);
  const activitiesCost = useMemo(() =>
    Object.entries(activityQty).reduce((sum, [key, qty]) => {
      const [, actId] = key.split(':');
      const a = ACTIVITIES.find(x => x.id === actId);
      return sum + (a ? a.price * qty * guests : 0);
    }, 0), [activityQty, guests]);

  const subtotal     = stayCost + transferCost + activitiesCost;
  const gst          = Math.round(subtotal * GST_RATE);
  const totalWithGst = subtotal + gst;

  /* --- Allocation --- */
  const allocated   = Object.values(nightsPerIsland).reduce((a, b) => a + b, 0);
  const allocatedOk = allocated === nights;

  const adjustIslandNights = (id, delta) => {
    setNightsPerIsland(prev => {
      const cur    = prev[id] || 0;
      const others = Object.entries(prev).filter(([k]) => k !== id).reduce((a, [, v]) => a + v, 0);
      const next   = Math.max(1, cur + delta);
      if (others + next > nights && delta > 0) return prev;
      return { ...prev, [id]: next };
    });
  };

  const redistributeEvenly = () => {
    if (!selectedIslands.length) return;
    const base = Math.floor(nights / selectedIslands.length);
    const rem  = nights % selectedIslands.length;
    const dist = {};
    selectedIslands.forEach((id, i) => { dist[id] = base + (i < rem ? 1 : 0); });
    setNightsPerIsland(dist);
  };

  /* --- Interactions --- */
  const toggleIsland  = id => setSelectedIslands(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const updateActivity = (islandId, activityId, delta) => {
    const key = `${islandId}:${activityId}`;
    setActivityQty(prev => {
      const cur  = prev[key] || 0;
      const cap  = nightsPerIsland[islandId] || 0;
      const next = Math.max(0, Math.min(cap, cur + delta));
      if (next === 0) { const { [key]: _, ...rest } = prev; return rest; }
      return { ...prev, [key]: next };
    });
  };

  const dismissToast = id => setToasts(t => t.filter(x => x.id !== id));

  const resetTrip = () => {
    setStep(1); setPackageType(null); setNights(7); setGuests(2);
    setTravelMonth(null); setSelectedIslands([]); setNightsPerIsland({}); setActivityQty({});
    prevKey.current = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  /* --- Apply featured package --- */
  const applyFeaturedPackage = fp => {
    setPackageType(fp.packageType);
    setNights(fp.nights);
    setGuests(fp.guests);
    setTravelMonth(fp.month);
    setSelectedIslands(fp.islands);
    prevKey.current = '';
    setStep(4);
  };

  /* --- Validation --- */
  const canAdvance = () => {
    if (step === 1) return !!packageType;
    if (step === 2) return !!travelMonth;
    if (step === 3) return selectedIslands.length > 0 && selectedIslands.length <= nights;
    if (step === 4) return allocatedOk;
    return true;
  };

  const getStepError = () => {
    if (step === 1) return 'Pick a style of stay to keep going.';
    if (step === 2) return 'Choose a travel month to continue.';
    if (step === 3) {
      if (!selectedIslands.length) return 'Pick at least one island.';
      if (selectedIslands.length > nights) return `${selectedIslands.length} islands but only ${nights} nights — deselect one or add more nights.`;
    }
    if (step === 4) {
      const diff = nights - allocated;
      return `Assign all ${nights} nights — ${diff} night${diff !== 1 ? 's' : ''} still floating.`;
    }
    return null;
  };

  /* --- Derived display --- */
  const summaryByIsland = useMemo(() => {
    const groups = {};
    Object.entries(activityQty).forEach(([key, qty]) => {
      const [islandId, activityId] = key.split(':');
      if (!groups[islandId]) groups[islandId] = [];
      const a = ACTIVITIES.find(x => x.id === activityId);
      if (a) groups[islandId].push({ ...a, qty, key });
    });
    return groups;
  }, [activityQty]);

  const monthLabel = travelMonth ? MONTHS.find(m => m.n === travelMonth).name : null;
  const stepError  = canAdvance() ? null : getStepError();

  const islandNames = selectedIslands.map(id => islandById[id]?.name).filter(Boolean).join(', ');

  const bookingSummary = {
    title:  `${pkg?.name ?? ''} · ${monthLabel ?? ''}`,
    detail: `${nights} nights · ${guests} traveler${guests !== 1 ? 's' : ''} · ${islandNames || 'No islands'}`,
    subtotal, gst, totalWithGst,
  };

  const bookingTripData = {
    packageType, nights, guests, travelMonth, monthName: monthLabel,
    selectedIslands, islandNames, nightsPerIsland, activityQty,
  };

  /* --- Navigate from Destinations to wizard --- */
  const planFromIsland = (type, islandId) => {
    setPackageType(type);
    setSelectedIslands([islandId]);
    prevKey.current = '';
    setStep(2);
    setCurrentPage('home');
  };

  /* ===== RENDER ===== */
  return (
    <div className="min-h-screen w-full" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>

      {/* ===== HEADER ===== */}
      <header className="border-b backdrop-blur-sm sticky top-0 z-30" style={{ borderColor: C.border, background: 'rgba(255,249,240,0.9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="Go home">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ background: C.navy }}>
              <Waves className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-xl leading-none" style={{ color: C.navy }}>
                Faru & Co<span className="font-display-italic">.</span>
              </div>
              <div className="text-[9px] tracking-[0.25em] uppercase mt-0.5" style={{ color: C.textLight }}>
                Maldives, designed by you
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: C.textMid }}>
              {[['destinations', 'Destinations'], ['journal', 'Journal'], ['contact', 'Contact']].map(([page, label]) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="transition-colors hover:opacity-100"
                  style={{ color: currentPage === page ? C.navy : C.textMid, fontWeight: currentPage === page ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>
            {step > 1 && (
              <button
                onClick={resetTrip}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border transition-colors hover:bg-white"
                style={{ borderColor: C.border, color: C.textLight }}
                aria-label="Start over"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">Start over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== OTHER PAGES ===== */}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'destinations' && <DestinationsPage onPlanTrip={planFromIsland} />}
      {currentPage === 'journal' && <JournalPage />}
      {currentPage === 'contact' && <ContactPage />}

      {/* ===== WIZARD (home) ===== */}
      {currentPage === 'home' && <>
      {/* ===== HERO ===== */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1.5 rounded-full"
              style={{ background: C.gold + '33', color: '#9a6f00' }}
            >
              <Zap className="w-3 h-3" aria-hidden="true" />
              Build your own escape
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-3" style={{ color: C.navy }}>
              Life's too short for<br />
              <span className="font-display-italic" style={{ color: C.coral }}>ordinary</span> vacations.
            </h1>
            <p className="text-base max-w-md" style={{ color: C.textMid }}>
              Pick your islands, stack your nights, collect the moments you'll never stop talking about.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: 'white', color: C.textLight, boxShadow: '0 2px 12px rgba(12,52,65,0.08)' }}>
            <MapPin className="w-4 h-4" style={{ color: C.coral }} aria-hidden="true" />
            Based in Malé · 1,192 islands
          </div>
        </div>

        {/* Step progress */}
        <nav
          aria-label="Booking steps"
          className="flex items-center gap-1 md:gap-3 border-t border-b py-4"
          style={{ borderColor: C.border }}
        >
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 md:gap-3 flex-1">
              <button
                onClick={() => s.n < step && setStep(s.n)}
                className="flex items-center gap-2 min-w-0 disabled:cursor-default"
                aria-label={`Step ${s.n}: ${s.label}`}
                aria-current={step === s.n ? 'step' : undefined}
                disabled={s.n >= step}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all"
                  style={{
                    background: step > s.n ? C.teal : step === s.n ? C.navy : 'transparent',
                    border: step >= s.n ? 'none' : `1.5px solid ${C.border}`,
                    color: step >= s.n ? '#fff' : C.textLight,
                  }}
                  aria-hidden="true"
                >
                  {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className="text-sm font-medium truncate hidden sm:inline" style={{ color: step >= s.n ? C.navy : C.textLight }}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && <div className="h-px flex-1" style={{ background: C.border }} aria-hidden="true" />}
            </div>
          ))}
        </nav>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-32 lg:pb-20 grid lg:grid-cols-[1fr_380px] gap-10">
        <main>
          <div className="fade-in" key={step}>

            {/* ── STEP 1: STYLE ── */}
            {step === 1 && (
              <section aria-label="Choose your style of stay">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>How do you want to wake up?</h2>
                <p className="mb-8" style={{ color: C.textMid }}>Two very different mornings. Both absolutely perfect.</p>
                <div className="grid md:grid-cols-2 gap-5">
                  {PACKAGES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPackageType(p.id)}
                      className="text-left rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 group"
                      style={{
                        borderColor: packageType === p.id ? C.navy : 'transparent',
                        background: p.id === 'local' ? C.cream : C.seafoam,
                        boxShadow: packageType === p.id ? `0 0 0 3px ${C.navy}22` : 'none',
                      }}
                      aria-pressed={packageType === p.id}
                    >
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={p.id === 'local' ? '/images/local-island.png' : '/images/private-resort.png'}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,52,65,0.35) 0%, transparent 60%)' }} />
                        {packageType === p.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: C.teal }} aria-hidden="true">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-xs tracking-[0.2em] uppercase mb-1.5 font-semibold" style={{ color: C.coral }}>{p.tagline}</div>
                        <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>{p.name}</h3>
                        <p className="text-sm mb-4 leading-relaxed" style={{ color: C.textMid }}>{p.description}</p>
                        <div className="text-sm" style={{ color: C.navy }}>
                          from <span className="font-display text-xl">${p.basePerNight}</span>
                          <span style={{ color: C.textLight }}> / person / night</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-10">
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                  <span className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap" style={{ background: 'white', color: C.textLight, border: `1px solid ${C.border}` }}>
                    Or start with a curated trip ↓
                  </span>
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                </div>

                {/* Featured packages */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: C.coral }}>Popular escapes ✦</div>
                      <h2 className="font-display text-2xl" style={{ color: C.navy }}>Start with a curated trip</h2>
                    </div>
                    <div className="text-xs hidden sm:block" style={{ color: C.textLight }}>Pre-filled & ready to tweak</div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {FEATURED.map(fp => (
                      <FeaturedCard key={fp.id} pkg={fp} onClick={() => applyFeaturedPackage(fp)} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── STEP 2: DATES ── */}
            {step === 2 && (
              <section aria-label="Choose dates and guests">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>When are you going?</h2>
                <p className="mb-8" style={{ color: C.textMid }}>
                  Dry season (Nov–Apr) = calm seas and blazing skies. Wet season (May–Oct) = fewer crowds, manta rays, and moody magic.
                </p>

                <fieldset className="mb-5 border-0 p-0 m-0">
                  <legend className="text-xs tracking-[0.2em] uppercase mb-3 font-semibold" style={{ color: C.textLight }}>Travel month</legend>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {MONTHS.map(m => {
                      const sel = travelMonth === m.n;
                      return (
                        <button key={m.n} type="button" onClick={() => setTravelMonth(m.n)}
                          className="p-2 rounded-xl border-2 transition-all text-center hover:scale-105"
                          style={{ background: sel ? C.navy : 'white', borderColor: sel ? C.navy : C.border, color: sel ? 'white' : C.navy }}
                          aria-pressed={sel} aria-label={`${m.name} — ${m.season} season`}
                        >
                          <div className="text-xs font-semibold">{m.short}</div>
                          <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1" style={{ background: m.season === 'dry' ? (sel ? C.gold : C.copper) : (sel ? C.ltTeal : C.teal) }} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-5 mt-3 text-xs" style={{ color: C.textLight }}>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: C.copper }} aria-hidden="true" />Dry & sunny</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal }} aria-hidden="true" />Wet & wild</span>
                  </div>
                </fieldset>

                {/* Nights */}
                <div className="rounded-3xl p-6 mb-4" style={{ background: C.cream }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: C.textLight }}>Nights</div>
                      <div className="font-display text-4xl" style={{ color: C.navy }} aria-live="polite">{nights}</div>
                    </div>
                    <div className="flex gap-2">
                      {[[-1, 'Decrease nights', nights <= 2], [1, 'Increase nights', nights >= 21]].map(([d, label, dis]) => (
                        <button key={d} onClick={() => setNights(n => Math.max(2, Math.min(21, n + d)))} disabled={dis}
                          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/60 disabled:opacity-30 transition-all"
                          style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }} aria-label={label}>
                          {d < 0 ? <Minus className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="range" min="2" max="21" value={nights} onChange={e => setNights(Number(e.target.value))} className="w-full" aria-label={`Nights: ${nights}`} />
                  <div className="flex justify-between text-xs mt-2" style={{ color: C.textLight }}><span>2 nights</span><span>21 nights</span></div>
                </div>

                {/* Guests */}
                <div className="rounded-3xl p-6" style={{ background: C.seafoam }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: C.textLight }}>Travelers</div>
                      <div className="font-display text-4xl" style={{ color: C.navy }} aria-live="polite">{guests}</div>
                    </div>
                    <div className="flex gap-2">
                      {[[-1, 'Decrease travelers', guests <= 1], [1, 'Increase travelers', guests >= 12]].map(([d, label, dis]) => (
                        <button key={d} onClick={() => setGuests(g => Math.max(1, Math.min(12, g + d)))} disabled={dis}
                          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/60 disabled:opacity-30 transition-all"
                          style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }} aria-label={label}>
                          {d < 0 ? <Minus className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── STEP 3: ISLANDS ── */}
            {step === 3 && (
              <section aria-label="Choose islands">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>Which islands are calling?</h2>
                <p className="mb-4" style={{ color: C.textMid }}>
                  Stack them. Hop between them. Every one is a different world — up to {nights} for your {nights}-night trip.
                </p>

                {selectedIslands.length > nights && (
                  <div className="flex items-start gap-2 p-4 rounded-2xl mb-4 text-sm" style={{ background: C.warn, color: C.warnText }} role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>You've picked {selectedIslands.length} islands but only have {nights} nights. Deselect one, or go back and add more nights.</span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {islands.map(island => {
                    const sel = selectedIslands.includes(island.id);
                    return (
                      <button key={island.id} onClick={() => toggleIsland(island.id)}
                        className="text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ borderColor: sel ? C.navy : C.border, background: sel ? C.navy : 'white', color: sel ? 'white' : C.navy }}
                        aria-pressed={sel}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs tracking-[0.2em] uppercase mb-1 font-semibold" style={{ color: sel ? 'rgba(255,255,255,0.55)' : C.coral }}>{island.atoll}</div>
                            <h3 className="font-display text-2xl">{island.name}</h3>
                          </div>
                          <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1" style={{ borderColor: sel ? 'white' : 'rgba(12,52,65,0.3)', background: sel ? 'white' : 'transparent' }} aria-hidden="true">
                            {sel && <Check className="w-3.5 h-3.5" style={{ color: C.navy }} />}
                          </div>
                        </div>
                        <p className="text-sm mb-3" style={{ color: sel ? 'rgba(255,255,255,0.75)' : C.textMid }}>{island.note}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {island.tags.map(tag => (
                            <span key={tag} className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-medium" style={{ background: sel ? 'rgba(255,255,255,0.15)' : 'rgba(12,52,65,0.06)', color: sel ? 'white' : C.textMid }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── STEP 4: ITINERARY ── */}
            {step === 4 && (
              <section aria-label="Plan nights per island">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <h2 className="font-display text-3xl" style={{ color: C.navy }}>How long at each island?</h2>
                  <button onClick={redistributeEvenly}
                    className="flex items-center gap-1.5 text-xs tracking-wider uppercase px-4 py-2 rounded-full border font-semibold hover:bg-white transition-colors"
                    style={{ borderColor: C.border, color: C.navy }} aria-label="Split nights evenly">
                    <Shuffle className="w-3.5 h-3.5" aria-hidden="true" /> Split evenly
                  </button>
                </div>
                <p className="mb-6" style={{ color: C.textMid }}>
                  Move fast or linger slow — {nights} nights, {selectedIslands.length} {selectedIslands.length === 1 ? 'island' : 'islands'}. Your call.
                </p>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: C.textLight }}>
                    <span>Nights allocated</span>
                    <span style={{ color: allocatedOk ? C.teal : C.coral }} aria-live="polite">{allocated} / {nights} {allocatedOk ? '✓' : ''}</span>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden" style={{ background: 'rgba(12,52,65,0.08)' }} role="img" aria-label={`${allocated} of ${nights} nights allocated`}>
                    {selectedIslands.map((id, i) => {
                      const n = nightsPerIsland[id] || 0;
                      return <div key={id} className="flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${(n/nights)*100}%`, background: ISLAND_COLORS[i % ISLAND_COLORS.length] }}>{(n/nights)*100 > 10 && `${n}n`}</div>;
                    })}
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {selectedIslands.map((id, i) => {
                    const island = islandById[id];
                    const n = nightsPerIsland[id] || 0;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow" style={{ borderColor: C.border }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: ISLAND_COLORS[i % ISLAND_COLORS.length] }} aria-hidden="true">{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-lg" style={{ color: C.navy }}>{island.name}</div>
                          <div className="text-xs flex items-center gap-2" style={{ color: C.textLight }}>
                            <span>{island.atoll}</span>
                            {i > 0 && <><span aria-hidden="true">·</span><span className="flex items-center gap-1"><Plane className="w-3 h-3" aria-hidden="true" />transfer</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => adjustIslandNights(id, -1)} disabled={n <= 1} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity" style={{ background: 'rgba(12,52,65,0.07)', color: C.navy }} aria-label={`Decrease nights at ${island.name}`}>
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <div className="font-display text-xl min-w-[2.5rem] text-center" style={{ color: C.navy }} aria-live="polite">{n}<span className="text-xs ml-0.5" style={{ color: C.textLight }}>n</span></div>
                          <button onClick={() => adjustIslandNights(id, 1)} disabled={allocated >= nights} className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity" style={{ background: C.navy }} aria-label={`Increase nights at ${island.name}`}>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── STEP 5: EXPERIENCES ── */}
            {step === 5 && (
              <section aria-label="Add experiences">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>What memories are you collecting?</h2>
                <p className="mb-8" style={{ color: C.textMid }}>
                  Sunrise dives, manta rays at dusk, a private dinner on the sand — showing everything available in{' '}
                  <span className="font-semibold" style={{ color: C.navy }}>{monthLabel}</span>.
                </p>

                <div className="space-y-8">
                  {selectedIslands.map((islandId, idx) => {
                    const island   = islandById[islandId];
                    const n        = nightsPerIsland[islandId] || 0;
                    const dayStart = selectedIslands.slice(0, idx).reduce((a, id) => a + (nightsPerIsland[id] || 0), 0) + 1;
                    const dayEnd   = dayStart + n - 1;
                    const inSeason  = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && isActivityInSeason(a, travelMonth));
                    const offSeason = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && !isActivityInSeason(a, travelMonth));
                    return (
                      <div key={islandId}>
                        <div className="flex items-end justify-between mb-4 pb-3 border-b" style={{ borderColor: C.border }}>
                          <div>
                            <div className="text-xs tracking-[0.3em] uppercase mb-1 font-bold" style={{ color: C.coral }}>
                              Days {dayStart}{n > 1 ? `–${dayEnd}` : ''} · {n} {n === 1 ? 'night' : 'nights'}
                            </div>
                            <h3 className="font-display text-2xl" style={{ color: C.navy }}>
                              {island.name} <span className="font-display-italic text-base" style={{ color: C.textLight }}>at {island.atoll}</span>
                            </h3>
                          </div>
                          <div className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: C.cream, color: C.textMid }}>
                            Max {n} {n === 1 ? 'activity' : 'activities'}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {inSeason.map(act => {
                            const key  = `${islandId}:${act.id}`;
                            const qty  = activityQty[key] || 0;
                            const Icon = act.icon;
                            return (
                              <div key={key} className="p-4 rounded-2xl flex items-center gap-4 transition-all" style={{ background: qty > 0 ? C.seafoam : 'white', border: `1.5px solid ${qty > 0 ? C.ltTeal : C.border}` }}>
                                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ background: qty > 0 ? C.navy : C.sand }} aria-hidden="true">
                                  <Icon className="w-5 h-5" style={{ color: qty > 0 ? 'white' : C.navy }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm" style={{ color: C.navy }}>{act.name}</div>
                                  <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: C.textLight }}>
                                    <span>${act.price} pp</span><span aria-hidden="true">·</span><span>{act.duration}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {qty > 0 && (
                                    <>
                                      <button onClick={() => updateActivity(islandId, act.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(12,52,65,0.08)', color: C.navy }} aria-label={`Remove ${act.name}`}>
                                        <Minus className="w-3 h-3" aria-hidden="true" />
                                      </button>
                                      <span className="font-display text-base w-5 text-center" style={{ color: C.navy }}>{qty}</span>
                                    </>
                                  )}
                                  <button onClick={() => updateActivity(islandId, act.id, 1)} disabled={qty >= n} className="w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity" style={{ background: qty >= n ? C.textLight : C.navy }} aria-label={qty >= n ? `Max ${n} activities` : `Add ${act.name}`} title={qty >= n ? `Max ${n} activities (1 per night)` : undefined}>
                                    <Plus className="w-3 h-3" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {offSeason.length > 0 && (
                            <details className="col-span-full">
                              <summary className="text-xs cursor-pointer mb-2 select-none" style={{ color: C.textLight }}>
                                {offSeason.length} experience{offSeason.length !== 1 ? 's' : ''} out of season in {monthLabel}
                              </summary>
                              <div className="grid md:grid-cols-2 gap-3">
                                {offSeason.map(act => {
                                  const Icon = act.icon;
                                  return (
                                    <div key={`${islandId}:${act.id}`} className="p-4 rounded-2xl flex items-center gap-4 opacity-45" style={{ background: 'white', border: `1px dashed ${C.border}` }}>
                                      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: C.sand }} aria-hidden="true"><Icon className="w-5 h-5" style={{ color: C.navy }} /></div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm" style={{ color: C.navy }}>{act.name}</div>
                                        <div className="text-xs mt-0.5" style={{ color: C.copper }}>Season: {act.activeMonths.map(n => MONTHS[n-1].short).join(', ')}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── NAV BUTTONS ── */}
            <div className="flex flex-col items-end gap-3 mt-12 pt-6 border-t" style={{ borderColor: C.border }}>
              <div className="flex justify-between items-center w-full">
                <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}
                  className="flex items-center gap-2 text-sm disabled:opacity-30 transition-opacity font-medium"
                  style={{ color: C.navy }} aria-label="Previous step">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>

                {step < 5 ? (
                  <button onClick={() => canAdvance() && setStep(s => Math.min(5, s+1))} disabled={!canAdvance()}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: C.navy }} aria-describedby={stepError ? 'step-error' : undefined}>
                    Keep going <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                    Make it happen <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {stepError && (
                <p id="step-error" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: C.coral }} role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {stepError}
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ===== SIDEBAR ===== */}
        <aside className="lg:sticky lg:top-20 h-fit" aria-label="Trip summary">
          <div className="rounded-3xl p-6 border" style={{ background: 'white', borderColor: C.border, boxShadow: '0 4px 24px rgba(12,52,65,0.07)' }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-4 font-bold" style={{ color: C.coral }}>Your escape ✦</div>

            {!pkg ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-3">🌊</div>
                <p className="text-sm" style={{ color: C.textLight }}>Pick a style of stay to see your trip take shape.</p>
              </div>
            ) : (
              <>
                <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                  <div className="font-display text-xl" style={{ color: C.navy }}>{pkg.name}</div>
                  <div className="text-sm mt-1" style={{ color: C.textLight }}>
                    {monthLabel && <>{monthLabel} · </>}{nights} nights · {guests} {guests === 1 ? 'traveler' : 'travelers'}
                  </div>
                </div>

                {selectedIslands.length > 0 && (
                  <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                    <div className="text-xs tracking-[0.2em] uppercase mb-2 font-semibold" style={{ color: C.textLight }}>Itinerary</div>
                    <div className="space-y-2">
                      {selectedIslands.map(id => {
                        const island = islandById[id];
                        const n      = nightsPerIsland[id] || 0;
                        const acts   = summaryByIsland[id] || [];
                        return (
                          <div key={id}>
                            <div className="flex items-center justify-between text-sm" style={{ color: C.navy }}>
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" style={{ color: C.coral }} aria-hidden="true" />
                                <span className="font-semibold">{island.name}</span>
                              </span>
                              <span className="text-xs" style={{ color: C.textLight }}>{n}n</span>
                            </div>
                            {acts.length > 0 && (
                              <div className="pl-5 mt-1 space-y-0.5">
                                {acts.map(a => (
                                  <div key={a.key} className="flex justify-between text-xs" style={{ color: C.textLight }}>
                                    <span>{a.qty}× {a.name}</span>
                                    <span>${(a.price * a.qty * guests).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-sm pb-4 mb-4 border-b" style={{ color: C.textMid, borderColor: C.borderFaint }}>
                  <div className="flex justify-between"><span>Stay</span><span>${stayCost.toLocaleString()}</span></div>
                  {transferCost > 0 && <div className="flex justify-between"><span>Transfers</span><span>${transferCost.toLocaleString()}</span></div>}
                  {activitiesCost > 0 && <div className="flex justify-between"><span>Experiences</span><span>${activitiesCost.toLocaleString()}</span></div>}
                  <div className="flex justify-between pt-1.5 border-t text-xs" style={{ borderColor: C.borderFaint, color: C.textLight }}>
                    <span>GST (16%)</span><span>+${gst.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: C.textLight }}>Total incl. GST</span>
                  <span className="font-display text-3xl" style={{ color: C.navy }}>${totalWithGst.toLocaleString()}</span>
                </div>

                <div className="text-xs leading-relaxed mb-4" style={{ color: C.textLight }}>
                  Excludes international flights. Final quote confirmed within 24 hours.
                </div>

                {step === 5 && (
                  <button onClick={() => setShowModal(true)}
                    className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                    Make it happen <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ===== MOBILE PRICE BAR ===== */}
      {pkg && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(255,249,240,0.97)', borderColor: C.border, backdropFilter: 'blur(8px)' }} aria-label="Price summary">
          <div>
            <div className="text-xs font-medium" style={{ color: C.textLight }}>Total incl. GST</div>
            <div className="font-display text-2xl" style={{ color: C.navy }}>${totalWithGst.toLocaleString()}</div>
          </div>
          {step === 5 && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
              Book <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      </>}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <BookingModal isOpen={showModal} onClose={() => setShowModal(false)} summary={bookingSummary} tripData={bookingTripData} />

      {/* Footer */}
      <div className="text-center py-6 text-xs" style={{ color: C.textLight, borderTop: `1px solid ${C.border}` }}>
        © {new Date().getFullYear()} Faru & Co · Malé, Maldives ·{' '}
        <button onClick={() => setCurrentPage('admin')} className="hover:underline" style={{ color: C.textLight }}>Admin</button>
      </div>
    </div>
  );
}
