import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Waves, Fish, Anchor, Sun, Heart, Sparkles, MapPin,
  Plus, Minus, Check, Wind, Flower2, Camera, Utensils, Music,
  Compass, ArrowRight, ArrowLeft, X, AlertCircle, Shuffle, Plane,
  RotateCcw,
} from 'lucide-react';

/* ========== THEME ========== */
const C = {
  navy:        '#0c3441',
  teal:        '#2a9d8f',
  copper:      '#c97b4e',
  sand:        '#f5efe3',
  cream:       '#efe3cc',
  seafoam:     '#d8e6e2',
  ltTeal:      '#7fb5ae',
  tan:         '#d4a574',
  brown:       '#8b5a3c',
  textMid:     '#5a5348',
  textLight:   '#7a6f5e',
  border:      'rgba(12,52,65,0.12)',
  borderFaint: 'rgba(12,52,65,0.08)',
  warn:        '#fdecd1',
  warnText:    '#8a5a2b',
  error:       '#e53e3e',
};

const ISLAND_COLORS = [C.navy, C.teal, C.copper, C.ltTeal, C.tan, C.brown];

/* ========== DATA ========== */

const PACKAGES = [
  {
    id: 'local',
    name: 'Local Island',
    tagline: 'Live among Maldivians',
    description: 'Family-run guesthouses on inhabited islands. Authentic, affordable, close to local life.',
    basePerNight: 80,
  },
  {
    id: 'resort',
    name: 'Private Resort',
    tagline: 'One island, one resort',
    description: 'Private resort islands with overwater villas, fine dining, and total seclusion.',
    basePerNight: 520,
  },
];

const ISLANDS = {
  local: [
    { id: 'maafushi',   name: 'Maafushi',   atoll: 'Kaafu Atoll', zone: 'north-male', note: 'Classic first-timer choice',     tags: ['Beaches', 'Snorkeling'] },
    { id: 'hulhumale',  name: 'Hulhumalé',  atoll: 'Kaafu Atoll', zone: 'north-male', note: 'Next to Velana airport',          tags: ['Convenient'] },
    { id: 'thulusdhoo', name: 'Thulusdhoo', atoll: 'Kaafu Atoll', zone: 'north-male', note: 'Home of Cokes surf break',        tags: ['Surf'] },
    { id: 'fulidhoo',   name: 'Fulidhoo',   atoll: 'Vaavu Atoll', zone: 'vaavu',      note: 'Nurse sharks at the jetty',       tags: ['Quiet', 'Sharks'] },
    { id: 'dhigurah',   name: 'Dhigurah',   atoll: 'Ari Atoll',   zone: 'ari',        note: 'Whale sharks year-round',         tags: ['Whale Sharks'] },
    { id: 'rasdhoo',    name: 'Rasdhoo',    atoll: 'Ari Atoll',   zone: 'ari',        note: 'Hammerheads at dawn',             tags: ['Diving'] },
  ],
  resort: [
    { id: 'baa',        name: 'Baa Atoll',   atoll: 'UNESCO Biosphere', zone: 'baa',        note: 'Hanifaru Bay mantas',          tags: ['Mantas', 'UNESCO'] },
    { id: 'south-ari',  name: 'South Ari',   atoll: 'Ari Atoll',        zone: 'ari',        note: 'Whale shark sanctuary',        tags: ['Whale Sharks'] },
    { id: 'north-male', name: 'North Malé',  atoll: 'Kaafu Atoll',      zone: 'north-male', note: 'Quick speedboat transfer',     tags: ['Accessible'] },
    { id: 'lhaviyani',  name: 'Lhaviyani',   atoll: 'Northern Atolls',  zone: 'lhaviyani',  note: 'Secluded overwater villas',    tags: ['Secluded'] },
    { id: 'raa',        name: 'Raa Atoll',   atoll: 'Raa Atoll',        zone: 'raa',        note: 'Untouched house reefs',        tags: ['Remote'] },
    { id: 'noonu',      name: 'Noonu Atoll', atoll: 'Noonu Atoll',      zone: 'noonu',      note: 'Seaplane access only',         tags: ['Luxury'] },
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

const GST_RATE = 0.16;
const STORAGE_KEY = 'faru_trip_v1';

/* ========== HELPERS ========== */

const isActivityAvailableAt = (activity, islandId) =>
  activity.availableAt === '*' || activity.availableAt.includes(islandId);

const isActivityInSeason = (activity, month) =>
  !month || activity.activeMonths.includes(month);

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function generateRef() {
  return 'FARU-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/* ========== TOAST STACK ========== */

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm px-4"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-white text-sm font-medium shadow-lg pointer-events-auto w-full"
          style={{ background: C.navy }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
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
      style={{ background: 'rgba(12,52,65,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'white' }}>

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.copper }}>Almost there</div>
            <h2 id="booking-modal-title" className="font-display text-2xl mt-0.5" style={{ color: C.navy }}>
              Request your booking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" style={{ color: C.textMid }} />
          </button>
        </div>

        <div className="px-6 sm:px-8 py-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: C.seafoam }}
              >
                <Check className="w-8 h-8" style={{ color: C.teal }} aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>Request received!</h3>
              <p className="text-sm mb-5" style={{ color: C.textMid }}>
                We'll confirm your itinerary and send a final quote within 24 hours.
              </p>
              <div
                className="inline-block px-5 py-2.5 rounded-full text-sm font-medium mb-4"
                style={{ background: C.cream, color: C.navy }}
              >
                Reference: <span className="font-display text-base">{bookingRef}</span>
              </div>
              <p className="text-xs" style={{ color: C.textLight }}>
                Keep this reference for all future correspondence regarding your trip.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 rounded-full text-white text-sm font-medium block mx-auto"
                style={{ background: C.navy }}
              >
                Back to my trip
              </button>
            </div>
          ) : (
            <>
              {/* Trip summary */}
              <div className="p-4 rounded-xl mb-6 text-sm" style={{ background: C.sand }}>
                <div className="font-medium mb-1" style={{ color: C.navy }}>{summary.title}</div>
                <div className="text-xs mb-2" style={{ color: C.textLight }}>{summary.detail}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-xl" style={{ color: C.navy }}>
                    ${summary.totalWithGst.toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: C.textLight }}>incl. 16% GST</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs uppercase tracking-wider mb-1.5"
                      style={{ color: C.textLight }}
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      value={form.firstName}
                      onChange={setField('firstName')}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                      style={inputStyle('firstName')}
                      placeholder="Amira"
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs uppercase tracking-wider mb-1.5"
                      style={{ color: C.textLight }}
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      value={form.lastName}
                      onChange={setField('lastName')}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                      style={inputStyle('lastName')}
                      placeholder="Hassan"
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: C.textLight }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={inputStyle('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: C.textLight }}
                  >
                    Phone / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={setField('phone')}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={inputStyle('phone')}
                    placeholder="+1 234 567 8900"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors.phone}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="notes"
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: C.textLight }}
                  >
                    Special requests <span style={{ color: C.textLight, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={setField('notes')}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none"
                    style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
                    rows={3}
                    placeholder="Dietary requirements, anniversary celebrations, accessibility needs…"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-white text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: C.copper }}
                >
                  Send booking request
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <p className="text-xs text-center mt-3" style={{ color: C.textLight }}>
                  No payment required now. We'll confirm availability and send a final quote within 24 hours.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== MAIN APP ========== */

export default function App() {
  // Restore from localStorage once before first render
  const saved = useRef(loadSavedState()).current || {};

  const [step, setStep]                     = useState(saved.step ?? 1);
  const [packageType, setPackageType]       = useState(saved.packageType ?? null);
  const [nights, setNights]                 = useState(saved.nights ?? 5);
  const [guests, setGuests]                 = useState(saved.guests ?? 2);
  const [travelMonth, setTravelMonth]       = useState(saved.travelMonth ?? null);
  const [selectedIslands, setSelectedIslands] = useState(saved.selectedIslands ?? []);
  const [nightsPerIsland, setNightsPerIsland] = useState(saved.nightsPerIsland ?? {});
  const [activityQty, setActivityQty]       = useState(saved.activityQty ?? {});
  const [toasts, setToasts]                 = useState([]);
  const [showModal, setShowModal]           = useState(false);

  const prevKey  = useRef('');
  const toastId  = useRef(0);

  // --- Persist state ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step, packageType, nights, guests, travelMonth,
        selectedIslands, nightsPerIsland, activityQty,
      }));
    } catch {}
  }, [step, packageType, nights, guests, travelMonth, selectedIslands, nightsPerIsland, activityQty]);

  // --- Derived ---
  const islandById = useMemo(() => {
    const map = {};
    [...ISLANDS.local, ...ISLANDS.resort].forEach(i => { map[i.id] = i; });
    return map;
  }, []);

  const pkg     = PACKAGES.find(p => p.id === packageType);
  const islands = packageType ? ISLANDS[packageType] : [];

  // --- Night allocation (bug-fixed) ---
  useEffect(() => {
    const key = selectedIslands.join(',') + '|' + nights;
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (selectedIslands.length === 0) {
      setNightsPerIsland({});
      return;
    }

    const dist = {};

    if (selectedIslands.length > nights) {
      // More islands than nights: give 1 night to the first N islands only
      selectedIslands.forEach((id, i) => {
        if (i < nights) dist[id] = 1;
      });
    } else {
      const base      = Math.floor(nights / selectedIslands.length);
      const remainder = nights % selectedIslands.length;
      selectedIslands.forEach((id, i) => {
        dist[id] = base + (i < remainder ? 1 : 0);
      });
    }

    setNightsPerIsland(dist);
  }, [selectedIslands, nights]);

  // --- Activity cleanup with toast notifications ---
  useEffect(() => {
    setActivityQty(prev => {
      const out     = {};
      const removed = [];

      Object.entries(prev).forEach(([key, qty]) => {
        const [islandId, activityId] = key.split(':');
        if (!selectedIslands.includes(islandId)) return;
        const activity = ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return;
        if (!isActivityAvailableAt(activity, islandId)) return;
        if (!isActivityInSeason(activity, travelMonth)) {
          removed.push(activity.name);
          return;
        }
        const cap     = nightsPerIsland[islandId] || 0;
        const clamped = Math.min(qty, cap);
        if (clamped > 0) out[key] = clamped;
        else if (qty > 0) removed.push(activity.name);
      });

      if (removed.length > 0) {
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

  // --- Costs ---
  const stayCost = useMemo(
    () => (pkg ? pkg.basePerNight * nights * guests : 0),
    [pkg, nights, guests],
  );

  const transferCost = useMemo(() => {
    if (selectedIslands.length <= 1) return 0;
    const perTransfer = packageType === 'resort' ? 180 : 45;
    return (selectedIslands.length - 1) * perTransfer * guests;
  }, [selectedIslands, packageType, guests]);

  const activitiesCost = useMemo(() =>
    Object.entries(activityQty).reduce((sum, [key, qty]) => {
      const [, activityId] = key.split(':');
      const a = ACTIVITIES.find(x => x.id === activityId);
      return sum + (a ? a.price * qty * guests : 0);
    }, 0),
    [activityQty, guests],
  );

  const subtotal     = stayCost + transferCost + activitiesCost;
  const gst          = Math.round(subtotal * GST_RATE);
  const totalWithGst = subtotal + gst;

  // --- Allocation ---
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
    const base      = Math.floor(nights / selectedIslands.length);
    const remainder = nights % selectedIslands.length;
    const dist      = {};
    selectedIslands.forEach((id, i) => { dist[id] = base + (i < remainder ? 1 : 0); });
    setNightsPerIsland(dist);
  };

  // --- Interactions ---
  const toggleIsland = (id) =>
    setSelectedIslands(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  const updateActivity = (islandId, activityId, delta) => {
    const key = `${islandId}:${activityId}`;
    setActivityQty(prev => {
      const cur  = prev[key] || 0;
      const cap  = nightsPerIsland[islandId] || 0;
      const next = Math.max(0, Math.min(cap, cur + delta));
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const dismissToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  const resetTrip = () => {
    setStep(1);
    setPackageType(null);
    setNights(5);
    setGuests(2);
    setTravelMonth(null);
    setSelectedIslands([]);
    setNightsPerIsland({});
    setActivityQty({});
    prevKey.current = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // --- Validation ---
  const canAdvance = () => {
    if (step === 1) return !!packageType;
    if (step === 2) return !!travelMonth;
    if (step === 3) return selectedIslands.length > 0 && selectedIslands.length <= nights;
    if (step === 4) return allocatedOk;
    return true;
  };

  const getStepError = () => {
    if (step === 1) return 'Select a style of stay to continue.';
    if (step === 2) return 'Select a travel month to continue.';
    if (step === 3) {
      if (!selectedIslands.length) return 'Select at least one island to continue.';
      if (selectedIslands.length > nights)
        return `You have ${selectedIslands.length} islands but only ${nights} nights. Deselect an island or go back and add more nights.`;
    }
    if (step === 4) {
      const diff = nights - allocated;
      return `Assign all ${nights} nights. ${diff} night${diff !== 1 ? 's' : ''} still unallocated.`;
    }
    return null;
  };

  // --- Derived display ---
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
    title: `${pkg?.name ?? ''} · ${monthLabel ?? ''}`,
    detail: `${nights} nights · ${guests} traveler${guests !== 1 ? 's' : ''} · ${
      selectedIslands.map(id => islandById[id]?.name).filter(Boolean).join(', ') || 'No islands'
    }`,
    subtotal,
    gst,
    totalWithGst,
  };

  /* ===== RENDER ===== */
  return (
    <div className="min-h-screen w-full" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>

      {/* ===== HEADER ===== */}
      <header className="border-b" style={{ borderColor: C.border }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: C.navy }}
              aria-hidden="true"
            >
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-xl leading-none" style={{ color: C.navy }}>
                Faru & Co<span className="font-display-italic">.</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: C.textLight }}>
                Maldives, designed by you
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: '#5a5348' }}>
              <span>Destinations</span>
              <span>Journal</span>
              <span>Contact</span>
            </div>
            {step > 1 && (
              <button
                onClick={resetTrip}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border hover:bg-white/50 transition-colors"
                style={{ borderColor: C.border, color: C.textLight }}
                aria-label="Start over — reset your trip"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">Start over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO + STEPS ===== */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.copper }}>
              Build your own
            </div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05]" style={{ color: C.navy }}>
              A vacation, <span className="font-display-italic">shaped</span>
              <br />around you.
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textLight }}>
            <MapPin className="w-4 h-4" aria-hidden="true" />
            Based in Malé · 1,192 islands to choose from
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
                className="flex items-center gap-2 min-w-0"
                aria-label={`Step ${s.n}: ${s.label}${step > s.n ? ' (completed)' : step === s.n ? ' (current)' : ''}`}
                aria-current={step === s.n ? 'step' : undefined}
                disabled={s.n >= step}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all"
                  style={{
                    background: step >= s.n ? C.navy : 'transparent',
                    border: step >= s.n ? 'none' : `1px solid ${C.border}`,
                    color: step >= s.n ? '#fff' : C.textLight,
                  }}
                  aria-hidden="true"
                >
                  {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span
                  className="text-sm font-medium truncate hidden sm:inline"
                  style={{ color: step >= s.n ? C.navy : C.textLight }}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1" style={{ background: 'rgba(12,52,65,0.15)' }} aria-hidden="true" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-28 lg:pb-20 grid lg:grid-cols-[1fr_380px] gap-10">
        <main>
          <div className="fade-in" key={step}>

            {/* ----- STEP 1: PACKAGE ----- */}
            {step === 1 && (
              <section aria-label="Choose your style of stay">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>Pick your style of stay</h2>
                <p className="mb-8" style={{ color: C.textMid }}>
                  Two very different ways to experience the Maldives. Both are beautiful.
                </p>
                <div className="grid md:grid-cols-2 gap-5">
                  {PACKAGES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPackageType(p.id)}
                      className="text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-1 border-2"
                      style={{
                        borderColor: packageType === p.id ? C.navy : 'transparent',
                        background: p.id === 'local' ? C.cream : C.seafoam,
                      }}
                      aria-pressed={packageType === p.id}
                    >
                      <div className="h-48 relative overflow-hidden grain">
                        {p.id === 'local' ? (
                          <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
                            <defs>
                              <linearGradient id="sky1" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stopColor="#f8d9a8" />
                                <stop offset="1" stopColor="#efc896" />
                              </linearGradient>
                            </defs>
                            <rect width="400" height="200" fill="url(#sky1)" />
                            <circle cx="320" cy="60" r="28" fill="#f4a261" opacity="0.8" />
                            <path d="M0,140 Q100,120 200,135 T400,130 L400,200 L0,200 Z" fill="#e8c792" />
                            <path d="M0,160 Q100,145 200,155 T400,150 L400,200 L0,200 Z" fill="#d4a574" />
                            <g transform="translate(60,80)">
                              <rect x="-2" y="0" width="4" height="70" fill="#4a3728" />
                              <path d="M0,0 Q-25,-10 -40,-5 M0,0 Q25,-10 40,-5 M0,0 Q-15,-25 -25,-30 M0,0 Q15,-25 25,-30" stroke="#3d5941" strokeWidth="3" fill="none" strokeLinecap="round" />
                            </g>
                            <g transform="translate(340,90)">
                              <rect x="-2" y="0" width="4" height="60" fill="#4a3728" />
                              <path d="M0,0 Q-20,-8 -32,-4 M0,0 Q20,-8 32,-4 M0,0 Q-12,-20 -20,-24 M0,0 Q12,-20 20,-24" stroke="#3d5941" strokeWidth="3" fill="none" strokeLinecap="round" />
                            </g>
                            <rect x="170" y="110" width="60" height="35" fill="#faf0d7" />
                            <path d="M165,110 L200,88 L235,110 Z" fill="#8b5a3c" />
                            <rect x="195" y="125" width="10" height="20" fill="#4a3728" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
                            <defs>
                              <linearGradient id="sky2" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" stopColor="#b8d8d4" />
                                <stop offset="1" stopColor="#7fb5ae" />
                              </linearGradient>
                            </defs>
                            <rect width="400" height="200" fill="url(#sky2)" />
                            <path d="M0,130 Q200,115 400,130 L400,200 L0,200 Z" fill="#4a8a8a" />
                            <path d="M0,150 Q200,140 400,150 L400,200 L0,200 Z" fill="#2d6668" />
                            {[80, 160, 240, 320].map((x, i) => (
                              <g key={i} transform={`translate(${x},110)`}>
                                <rect x="-2" y="20" width="4" height="30" fill="#3a2a1e" />
                                <rect x="18" y="20" width="4" height="30" fill="#3a2a1e" />
                                <rect x="-10" y="8" width="34" height="16" fill="#f0e4c8" />
                                <path d="M-14,8 L7,-6 L28,8 Z" fill="#7a5840" />
                              </g>
                            ))}
                            <rect x="70" y="125" width="270" height="3" fill="#5a4030" />
                          </svg>
                        )}
                        {packageType === p.id && (
                          <div
                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: C.navy }}
                            aria-hidden="true"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: C.copper }}>
                          {p.tagline}
                        </div>
                        <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>{p.name}</h3>
                        <p className="text-sm mb-4" style={{ color: C.textMid }}>{p.description}</p>
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

            {/* ----- STEP 2: DATES + MONTH + GUESTS ----- */}
            {step === 2 && (
              <section aria-label="Choose dates and guests">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>When, how long, how many?</h2>
                <p className="mb-8" style={{ color: C.textMid }}>
                  The Maldives has two seasons. Dry (Nov–Apr) is calmer water and blue skies.
                  Wet (May–Oct) brings occasional storms but also manta season.
                </p>

                {/* Month picker */}
                <fieldset className="mb-5 border-0 p-0 m-0">
                  <legend className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.textLight }}>
                    Travel month
                  </legend>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {MONTHS.map(m => {
                      const selected = travelMonth === m.n;
                      return (
                        <button
                          key={m.n}
                          type="button"
                          onClick={() => setTravelMonth(m.n)}
                          className="p-2 rounded-lg border transition-all text-center"
                          style={{
                            background:   selected ? C.navy : 'white',
                            borderColor:  selected ? C.navy : C.border,
                            color:        selected ? 'white' : C.navy,
                          }}
                          aria-pressed={selected}
                          aria-label={`${m.name} — ${m.season} season`}
                        >
                          <div className="text-xs font-medium">{m.short}</div>
                          <div
                            className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                            style={{
                              background: m.season === 'dry'
                                ? (selected ? '#f4cc8a' : C.copper)
                                : (selected ? C.ltTeal : C.teal),
                            }}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-5 mt-3 text-xs" style={{ color: C.textLight }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.copper }} aria-hidden="true" />
                      Dry season
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.teal }} aria-hidden="true" />
                      Wet season
                    </span>
                  </div>
                </fieldset>

                {/* Nights */}
                <div className="rounded-2xl p-6 mb-4" style={{ background: C.cream }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: C.textLight }}>Nights</div>
                      <div className="font-display text-4xl" style={{ color: C.navy }} aria-live="polite" aria-atomic="true">
                        {nights}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNights(n => Math.max(2, n - 1))}
                        disabled={nights <= 2}
                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40 disabled:opacity-30 transition-colors"
                        style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }}
                        aria-label="Decrease nights"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setNights(n => Math.min(21, n + 1))}
                        disabled={nights >= 21}
                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40 disabled:opacity-30 transition-colors"
                        style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }}
                        aria-label="Increase nights"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="21"
                    value={nights}
                    onChange={e => setNights(Number(e.target.value))}
                    className="w-full"
                    aria-label={`Number of nights: ${nights}`}
                  />
                  <div className="flex justify-between text-xs mt-2" style={{ color: C.textLight }}>
                    <span>2 nights</span>
                    <span>21 nights</span>
                  </div>
                </div>

                {/* Guests */}
                <div className="rounded-2xl p-6" style={{ background: C.seafoam }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: C.textLight }}>Travelers</div>
                      <div className="font-display text-4xl" style={{ color: C.navy }} aria-live="polite" aria-atomic="true">
                        {guests}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGuests(g => Math.max(1, g - 1))}
                        disabled={guests <= 1}
                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40 disabled:opacity-30 transition-colors"
                        style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }}
                        aria-label="Decrease travelers"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setGuests(g => Math.min(12, g + 1))}
                        disabled={guests >= 12}
                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40 disabled:opacity-30 transition-colors"
                        style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }}
                        aria-label="Increase travelers"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ----- STEP 3: ISLANDS ----- */}
            {step === 3 && (
              <section aria-label="Choose islands">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>Pick your islands</h2>
                <p className="mb-4" style={{ color: C.textMid }}>
                  Hop between as many as you like — up to {nights} island{nights !== 1 ? 's' : ''} for your {nights}-night trip.
                  Each additional island adds a transfer.
                </p>

                {selectedIslands.length > nights && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
                    style={{ background: C.warn, color: C.warnText }}
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      You've selected {selectedIslands.length} islands but only have {nights} nights.
                      Deselect an island, or go back and add more nights.
                    </span>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {islands.map(island => {
                    const selected = selectedIslands.includes(island.id);
                    return (
                      <button
                        key={island.id}
                        onClick={() => toggleIsland(island.id)}
                        className="text-left p-5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: selected ? C.navy : C.border,
                          background:  selected ? C.navy : 'white',
                          color:       selected ? 'white' : C.navy,
                        }}
                        aria-pressed={selected}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div
                              className="text-xs tracking-[0.2em] uppercase mb-1"
                              style={{ color: selected ? 'rgba(255,255,255,0.6)' : C.copper }}
                            >
                              {island.atoll}
                            </div>
                            <h3 className="font-display text-2xl">{island.name}</h3>
                          </div>
                          <div
                            className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1"
                            style={{
                              borderColor: selected ? 'white' : 'rgba(12,52,65,0.3)',
                              background: selected ? 'white' : 'transparent',
                            }}
                            aria-hidden="true"
                          >
                            {selected && <Check className="w-3.5 h-3.5" style={{ color: C.navy }} />}
                          </div>
                        </div>
                        <p className="text-sm mb-3" style={{ color: selected ? 'rgba(255,255,255,0.8)' : C.textMid }}>
                          {island.note}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {island.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full"
                              style={{
                                background: selected ? 'rgba(255,255,255,0.15)' : 'rgba(12,52,65,0.06)',
                                color:      selected ? 'white' : C.textMid,
                              }}
                            >
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

            {/* ----- STEP 4: ITINERARY ----- */}
            {step === 4 && (
              <section aria-label="Plan your nights per island">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <h2 className="font-display text-3xl" style={{ color: C.navy }}>Plan your nights</h2>
                  <button
                    onClick={redistributeEvenly}
                    className="flex items-center gap-1.5 text-xs tracking-wider uppercase px-3 py-2 rounded-full border hover:bg-white/40 transition-colors"
                    style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }}
                    aria-label="Split nights evenly across all islands"
                  >
                    <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                    Split evenly
                  </button>
                </div>
                <p className="mb-6" style={{ color: C.textMid }}>
                  Split your {nights} nights among your {selectedIslands.length}{' '}
                  {selectedIslands.length === 1 ? 'island' : 'islands'}.
                </p>

                {/* Allocation bar */}
                <div className="mb-2">
                  <div
                    className="flex justify-between items-center mb-2 text-xs tracking-[0.2em] uppercase"
                    style={{ color: C.textLight }}
                  >
                    <span>Allocated</span>
                    <span style={{ color: allocatedOk ? C.teal : C.copper }} aria-live="polite">
                      {allocated} / {nights} {allocatedOk ? '✓' : ''}
                    </span>
                  </div>
                  <div
                    className="flex h-4 rounded-full overflow-hidden"
                    style={{ background: 'rgba(12,52,65,0.08)' }}
                    role="img"
                    aria-label={`Night allocation: ${allocated} of ${nights} nights assigned`}
                  >
                    {selectedIslands.map((id, i) => {
                      const n   = nightsPerIsland[id] || 0;
                      const pct = (n / nights) * 100;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-center text-[10px] font-medium text-white transition-all"
                          style={{ width: `${pct}%`, background: ISLAND_COLORS[i % ISLAND_COLORS.length] }}
                        >
                          {pct > 10 && `${n}n`}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Per-island controls */}
                <div className="space-y-3 mt-6">
                  {selectedIslands.map((id, i) => {
                    const island = islandById[id];
                    const n      = nightsPerIsland[id] || 0;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-white"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0"
                          style={{ background: ISLAND_COLORS[i % ISLAND_COLORS.length] }}
                          aria-hidden="true"
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-lg" style={{ color: C.navy }}>{island.name}</div>
                          <div className="text-xs flex items-center gap-2" style={{ color: C.textLight }}>
                            <span>{island.atoll}</span>
                            {i > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="flex items-center gap-1">
                                  <Plane className="w-3 h-3" aria-hidden="true" />
                                  transfer
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => adjustIslandNights(id, -1)}
                            disabled={n <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
                            style={{ background: 'rgba(12,52,65,0.08)', color: C.navy }}
                            aria-label={`Decrease nights at ${island.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <div
                            className="font-display text-xl min-w-[2.5rem] text-center"
                            style={{ color: C.navy }}
                            aria-live="polite"
                            aria-label={`${n} nights at ${island.name}`}
                          >
                            {n}<span className="text-xs ml-0.5" style={{ color: C.textLight }}>n</span>
                          </div>
                          <button
                            onClick={() => adjustIslandNights(id, 1)}
                            disabled={allocated >= nights}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
                            style={{ background: C.navy }}
                            aria-label={`Increase nights at ${island.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ----- STEP 5: ACTIVITIES ----- */}
            {step === 5 && (
              <section aria-label="Add experiences">
                <h2 className="font-display text-3xl mb-2" style={{ color: C.navy }}>Add experiences</h2>
                <p className="mb-8" style={{ color: C.textMid }}>
                  Showing activities available during{' '}
                  <span className="font-medium" style={{ color: C.navy }}>{monthLabel}</span>.
                  You can add up to 1 activity per night at each island.
                </p>

                <div className="space-y-8">
                  {selectedIslands.map((islandId, idx) => {
                    const island   = islandById[islandId];
                    const n        = nightsPerIsland[islandId] || 0;
                    const dayStart = selectedIslands.slice(0, idx).reduce(
                      (a, id) => a + (nightsPerIsland[id] || 0), 0,
                    ) + 1;
                    const dayEnd  = dayStart + n - 1;
                    const inSeason  = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && isActivityInSeason(a, travelMonth));
                    const offSeason = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && !isActivityInSeason(a, travelMonth));

                    return (
                      <div key={islandId}>
                        <div
                          className="flex items-end justify-between mb-4 pb-3 border-b"
                          style={{ borderColor: C.border }}
                        >
                          <div>
                            <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: C.copper }}>
                              Days {dayStart}{n > 1 ? `–${dayEnd}` : ''} · {n} {n === 1 ? 'night' : 'nights'}
                            </div>
                            <h3 className="font-display text-2xl" style={{ color: C.navy }}>
                              {island.name}{' '}
                              <span className="font-display-italic text-base" style={{ color: C.textLight }}>
                                at {island.atoll}
                              </span>
                            </h3>
                          </div>
                          <div className="text-xs" style={{ color: C.textLight }}>
                            Max {n} activit{n === 1 ? 'y' : 'ies'}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          {inSeason.map(act => {
                            const key  = `${islandId}:${act.id}`;
                            const qty  = activityQty[key] || 0;
                            const Icon = act.icon;
                            return (
                              <div
                                key={key}
                                className="p-4 rounded-xl flex items-center gap-4 transition-all"
                                style={{
                                  background: qty > 0 ? C.seafoam : 'white',
                                  border: `1px solid ${qty > 0 ? C.ltTeal : C.border}`,
                                }}
                              >
                                <div
                                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: qty > 0 ? C.navy : C.sand }}
                                  aria-hidden="true"
                                >
                                  <Icon className="w-5 h-5" style={{ color: qty > 0 ? 'white' : C.navy }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm" style={{ color: C.navy }}>{act.name}</div>
                                  <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: C.textLight }}>
                                    <span>${act.price} pp</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{act.duration}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {qty > 0 && (
                                    <>
                                      <button
                                        onClick={() => updateActivity(islandId, act.id, -1)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                        style={{ background: 'rgba(12,52,65,0.08)', color: C.navy }}
                                        aria-label={`Remove one ${act.name} session`}
                                      >
                                        <Minus className="w-3 h-3" aria-hidden="true" />
                                      </button>
                                      <span
                                        className="font-display text-base w-5 text-center"
                                        style={{ color: C.navy }}
                                        aria-label={`${qty} session${qty !== 1 ? 's' : ''}`}
                                      >
                                        {qty}
                                      </span>
                                    </>
                                  )}
                                  <button
                                    onClick={() => updateActivity(islandId, act.id, 1)}
                                    disabled={qty >= n}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
                                    style={{ background: C.navy }}
                                    aria-label={qty >= n ? `Maximum ${n} activities for this island` : `Add ${act.name}`}
                                    title={qty >= n ? `Max ${n} activities (1 per night)` : undefined}
                                  >
                                    <Plus className="w-3 h-3" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {offSeason.length > 0 && (
                            <details className="col-span-full">
                              <summary
                                className="text-xs cursor-pointer mb-2 select-none"
                                style={{ color: C.textLight }}
                              >
                                {offSeason.length} experience{offSeason.length !== 1 ? 's' : ''} out of season in {monthLabel}
                              </summary>
                              <div className="grid md:grid-cols-2 gap-3">
                                {offSeason.map(act => {
                                  const Icon         = act.icon;
                                  const seasonMonths = act.activeMonths.map(n => MONTHS[n - 1].short).join(', ');
                                  return (
                                    <div
                                      key={`${islandId}:${act.id}`}
                                      className="p-4 rounded-xl flex items-center gap-4 opacity-50"
                                      style={{ background: 'white', border: `1px dashed ${C.border}` }}
                                    >
                                      <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: C.sand }}
                                        aria-hidden="true"
                                      >
                                        <Icon className="w-5 h-5" style={{ color: C.navy }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm" style={{ color: C.navy }}>{act.name}</div>
                                        <div className="text-xs mt-0.5" style={{ color: C.copper }}>
                                          Season: {seasonMonths}
                                        </div>
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

            {/* ===== NAV BUTTONS ===== */}
            <div
              className="flex flex-col items-end gap-3 mt-10 pt-6 border-t"
              style={{ borderColor: C.border }}
            >
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-2 text-sm disabled:opacity-30 transition-opacity"
                  style={{ color: C.navy }}
                  aria-label="Go to previous step"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>

                {step < 5 ? (
                  <button
                    onClick={() => canAdvance() && setStep(s => Math.min(5, s + 1))}
                    disabled={!canAdvance()}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium disabled:opacity-40 transition-opacity"
                    style={{ background: C.navy }}
                    aria-describedby={stepError ? 'step-error' : undefined}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-transform hover:scale-[1.02]"
                    style={{ background: C.copper }}
                  >
                    Request booking
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Inline validation error */}
              {stepError && (
                <p
                  id="step-error"
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: C.copper }}
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {stepError}
                </p>
              )}
            </div>
          </div>
        </main>

        {/* ===== SUMMARY SIDEBAR ===== */}
        <aside className="lg:sticky lg:top-6 h-fit" aria-label="Trip summary">
          <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: C.border }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: C.copper }}>Your trip</div>

            {!pkg ? (
              <div className="py-8 text-center text-sm" style={{ color: C.textLight }}>
                Start by picking a style of stay.
              </div>
            ) : (
              <>
                <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                  <div className="font-display text-xl" style={{ color: C.navy }}>{pkg.name}</div>
                  <div className="text-sm mt-1" style={{ color: C.textLight }}>
                    {monthLabel && <>{monthLabel} · </>}
                    {nights} nights · {guests} {guests === 1 ? 'traveler' : 'travelers'}
                  </div>
                </div>

                {selectedIslands.length > 0 && (
                  <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                    <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: C.textLight }}>
                      Itinerary
                    </div>
                    <div className="space-y-2">
                      {selectedIslands.map(id => {
                        const island = islandById[id];
                        const n      = nightsPerIsland[id] || 0;
                        const acts   = summaryByIsland[id] || [];
                        return (
                          <div key={id}>
                            <div className="flex items-center justify-between text-sm" style={{ color: C.navy }}>
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" style={{ color: C.copper }} aria-hidden="true" />
                                <span className="font-medium">{island.name}</span>
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

                {/* Cost breakdown */}
                <div className="space-y-1.5 text-sm pb-4 mb-4 border-b" style={{ color: C.textMid, borderColor: C.borderFaint }}>
                  <div className="flex justify-between">
                    <span>Stay</span>
                    <span>${stayCost.toLocaleString()}</span>
                  </div>
                  {transferCost > 0 && (
                    <div className="flex justify-between">
                      <span>Island transfers</span>
                      <span>${transferCost.toLocaleString()}</span>
                    </div>
                  )}
                  {activitiesCost > 0 && (
                    <div className="flex justify-between">
                      <span>Experiences</span>
                      <span>${activitiesCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: C.borderFaint, color: C.textLight, fontSize: '0.75rem' }}>
                    <span>GST (16%)</span>
                    <span>+ ${gst.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs tracking-[0.2em] uppercase" style={{ color: C.textLight }}>
                    Total incl. GST
                  </span>
                  <span className="font-display text-3xl" style={{ color: C.navy }}>
                    ${totalWithGst.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs leading-relaxed" style={{ color: C.textLight }}>
                  Prices exclude international flights. Final quote confirmed within 24 hours.
                </div>

                {step === 5 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 w-full py-3 rounded-full text-white text-sm font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                    style={{ background: C.copper }}
                  >
                    Request booking
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ===== MOBILE STICKY PRICE BAR ===== */}
      {pkg && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t px-6 py-4 flex items-center justify-between"
          style={{ background: 'white', borderColor: C.border }}
          aria-label="Price summary"
        >
          <div>
            <div className="text-xs" style={{ color: C.textLight }}>Total incl. GST</div>
            <div className="font-display text-2xl" style={{ color: C.navy }}>
              ${totalWithGst.toLocaleString()}
            </div>
          </div>
          {step === 5 && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
              style={{ background: C.copper }}
            >
              Book
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* ===== TOAST NOTIFICATIONS ===== */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* ===== BOOKING MODAL ===== */}
      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        summary={bookingSummary}
      />
    </div>
  );
}
