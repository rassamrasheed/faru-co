import { useState, useMemo, useEffect, useRef } from 'react';
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

function BookingModal({ isOpen, onClose, summary }) {
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

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
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

  const bookingSummary = {
    title:  `${pkg?.name ?? ''} · ${monthLabel ?? ''}`,
    detail: `${nights} nights · ${guests} traveler${guests !== 1 ? 's' : ''} · ${selectedIslands.map(id => islandById[id]?.name).filter(Boolean).join(', ') || 'No islands'}`,
    subtotal, gst, totalWithGst,
  };

  /* ===== RENDER ===== */
  return (
    <div className="min-h-screen w-full" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>

      {/* ===== HEADER ===== */}
      <header className="border-b backdrop-blur-sm sticky top-0 z-30" style={{ borderColor: C.border, background: 'rgba(255,249,240,0.9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={resetTrip} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="Go home">
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
              <span className="cursor-default hover:text-opacity-70 transition-opacity">Destinations</span>
              <span className="cursor-default hover:text-opacity-70 transition-opacity">Journal</span>
              <span className="cursor-default hover:text-opacity-70 transition-opacity">Contact</span>
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

        {/* ===== FEATURED PACKAGES (step 1 only) ===== */}
        {step === 1 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: C.coral }}>
                  Popular escapes ✦
                </div>
                <h2 className="font-display text-2xl" style={{ color: C.navy }}>
                  Start with a curated trip
                </h2>
              </div>
              <div className="text-xs hidden sm:block" style={{ color: C.textLight }}>
                Pre-filled & ready to tweak
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED.map(fp => (
                <FeaturedCard key={fp.id} pkg={fp} onClick={() => applyFeaturedPackage(fp)} />
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="flex-1 h-px" style={{ background: C.border }} />
              <span className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap" style={{ background: 'white', color: C.textLight, border: `1px solid ${C.border}` }}>
                Or design yours from scratch ↓
              </span>
              <div className="flex-1 h-px" style={{ background: C.border }} />
            </div>
          </div>
        )}

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

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <BookingModal isOpen={showModal} onClose={() => setShowModal(false)} summary={bookingSummary} />
    </div>
  );
}
