import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Waves, Fish, Anchor, Sun, Heart, Sparkles, MapPin,
  Plus, Minus, Check, Wind, Flower2, Camera, Utensils, Music,
  Compass, ArrowRight, ArrowLeft, X, AlertCircle, Shuffle, Plane
} from 'lucide-react';

/* ==========  DATA  ========== */

const PACKAGES = [
  { id: 'local', name: 'Local Island', tagline: 'Live among Maldivians',
    description: 'Family-run guesthouses on inhabited islands. Authentic, affordable, close to local life.',
    basePerNight: 80 },
  { id: 'resort', name: 'Private Resort', tagline: 'One island, one resort',
    description: 'Private resort islands with overwater villas, fine dining, and total seclusion.',
    basePerNight: 520 },
];

const ISLANDS = {
  local: [
    { id: 'maafushi',   name: 'Maafushi',    atoll: 'Kaafu Atoll',  zone: 'north-male', note: 'Classic first-timer choice',     tags: ['Beaches', 'Snorkeling'] },
    { id: 'hulhumale',  name: 'Hulhumalé',   atoll: 'Kaafu Atoll',  zone: 'north-male', note: 'Next to Velana airport',          tags: ['Convenient'] },
    { id: 'thulusdhoo', name: 'Thulusdhoo',  atoll: 'Kaafu Atoll',  zone: 'north-male', note: 'Home of Cokes surf break',        tags: ['Surf'] },
    { id: 'fulidhoo',   name: 'Fulidhoo',    atoll: 'Vaavu Atoll',  zone: 'vaavu',      note: 'Nurse sharks at the jetty',       tags: ['Quiet', 'Sharks'] },
    { id: 'dhigurah',   name: 'Dhigurah',    atoll: 'Ari Atoll',    zone: 'ari',        note: 'Whale sharks year-round',         tags: ['Whale Sharks'] },
    { id: 'rasdhoo',    name: 'Rasdhoo',     atoll: 'Ari Atoll',    zone: 'ari',        note: 'Hammerheads at dawn',             tags: ['Diving'] },
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

const ALL_MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

// availableAt: '*' = every island, or an array of island ids
// activeMonths: array of month numbers when this activity runs
const ACTIVITIES = [
  { id: 'snorkel',    name: 'Snorkeling Trip',     icon: Fish,     price: 35,  duration: '3 hours',  availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'dive',       name: 'Scuba Diving',        icon: Anchor,   price: 110, duration: '4 hours',  availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'whaleshark', name: 'Whale Shark Safari',  icon: Waves,    price: 120, duration: 'Full day', availableAt: ['dhigurah', 'south-ari'],          activeMonths: ALL_MONTHS },
  { id: 'manta',      name: 'Manta Ray Snorkel',   icon: Sparkles, price: 85,  duration: 'Half day', availableAt: ['baa', 'south-ari', 'rasdhoo'],    activeMonths: [5,6,7,8,9,10,11] },
  { id: 'sunset',     name: 'Sunset Fishing',      icon: Sun,      price: 45,  duration: '3 hours',  availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'dolphin',    name: 'Dolphin Cruise',      icon: Heart,    price: 40,  duration: '2 hours',  availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'sandbank',   name: 'Sandbank Picnic',     icon: Wind,     price: 75,  duration: 'Half day', availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'spa',        name: 'Traditional Spa',     icon: Flower2,  price: 95,  duration: '90 min',   availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'surf',       name: 'Surf Lesson',         icon: Compass,  price: 60,  duration: '2 hours',  availableAt: ['thulusdhoo', 'north-male'],       activeMonths: [3,4,5,6,7,8,9,10] },
  { id: 'photo',      name: 'Photography Tour',    icon: Camera,   price: 150, duration: 'Full day', availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'dinner',     name: 'Private Beach Dinner',icon: Utensils, price: 85,  duration: 'Evening',  availableAt: '*',                                activeMonths: ALL_MONTHS },
  { id: 'boduberu',   name: 'Bodu Beru Show',      icon: Music,    price: 30,  duration: 'Evening',  availableAt: ['maafushi', 'fulidhoo', 'thulusdhoo'], activeMonths: ALL_MONTHS },
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

/* ==========  HELPERS  ========== */

const isActivityAvailableAt = (activity, islandId) =>
  activity.availableAt === '*' || activity.availableAt.includes(islandId);

const isActivityInSeason = (activity, month) =>
  !month || activity.activeMonths.includes(month);

/* ==========  COMPONENT  ========== */

export default function App() {
  const [step, setStep] = useState(1);
  const [packageType, setPackageType] = useState(null);
  const [nights, setNights] = useState(5);
  const [guests, setGuests] = useState(2);
  const [travelMonth, setTravelMonth] = useState(null);
  const [selectedIslands, setSelectedIslands] = useState([]);
  const [nightsPerIsland, setNightsPerIsland] = useState({});
  // key: "islandId:activityId"
  const [activityQty, setActivityQty] = useState({});

  const prevIslandsKey = useRef('');

  const pkg = PACKAGES.find(p => p.id === packageType);
  const islands = packageType ? ISLANDS[packageType] : [];
  const islandById = useMemo(() => {
    const map = {};
    [...ISLANDS.local, ...ISLANDS.resort].forEach(i => { map[i.id] = i; });
    return map;
  }, []);

  /* --- Auto-redistribute nights when islands or total nights change --- */
  useEffect(() => {
    const key = selectedIslands.join(',') + '|' + nights;
    if (key === prevIslandsKey.current) return;
    prevIslandsKey.current = key;

    if (selectedIslands.length === 0) {
      setNightsPerIsland({});
      return;
    }
    const base = Math.floor(nights / selectedIslands.length);
    const remainder = nights % selectedIslands.length;
    const dist = {};
    selectedIslands.forEach((id, i) => {
      dist[id] = Math.max(1, base + (i < remainder ? 1 : 0));
    });
    // If total > nights because of min=1 enforcement, trim from the last ones
    let allocated = Object.values(dist).reduce((a, b) => a + b, 0);
    const ids = [...selectedIslands].reverse();
    let idx = 0;
    while (allocated > nights && idx < ids.length) {
      if (dist[ids[idx]] > 1) {
        dist[ids[idx]] -= 1;
        allocated -= 1;
      } else {
        idx += 1;
      }
    }
    setNightsPerIsland(dist);
  }, [selectedIslands, nights]);

  /* --- Clean up activity quantities when islands/month/nights change --- */
  useEffect(() => {
    setActivityQty(prev => {
      const out = {};
      Object.entries(prev).forEach(([key, qty]) => {
        const [islandId, activityId] = key.split(':');
        if (!selectedIslands.includes(islandId)) return;
        const activity = ACTIVITIES.find(a => a.id === activityId);
        if (!activity) return;
        if (!isActivityAvailableAt(activity, islandId)) return;
        if (!isActivityInSeason(activity, travelMonth)) return;
        const cap = nightsPerIsland[islandId] || 0;
        const clamped = Math.min(qty, cap);
        if (clamped > 0) out[key] = clamped;
      });
      return out;
    });
  }, [selectedIslands, travelMonth, nightsPerIsland]);

  /* --- Costs --- */
  const stayCost = useMemo(() => pkg ? pkg.basePerNight * nights * guests : 0, [pkg, nights, guests]);

  const transferCost = useMemo(() => {
    if (selectedIslands.length <= 1) return 0;
    const perTransfer = packageType === 'resort' ? 180 : 45;
    return (selectedIslands.length - 1) * perTransfer * guests;
  }, [selectedIslands, packageType, guests]);

  const activitiesCost = useMemo(() => {
    return Object.entries(activityQty).reduce((sum, [key, qty]) => {
      const [, activityId] = key.split(':');
      const a = ACTIVITIES.find(x => x.id === activityId);
      return sum + (a ? a.price * qty * guests : 0);
    }, 0);
  }, [activityQty, guests]);

  const total = stayCost + transferCost + activitiesCost;

  /* --- Itinerary allocation helpers --- */
  const allocated = Object.values(nightsPerIsland).reduce((a, b) => a + b, 0);
  const allocatedOk = allocated === nights;

  const adjustIslandNights = (id, delta) => {
    setNightsPerIsland(prev => {
      const cur = prev[id] || 0;
      const others = Object.entries(prev).filter(([k]) => k !== id)
                                         .reduce((a, [, v]) => a + v, 0);
      const next = Math.max(1, cur + delta);
      // Enforce total <= nights
      if (others + next > nights && delta > 0) return prev;
      return { ...prev, [id]: next };
    });
  };

  const redistributeEvenly = () => {
    if (selectedIslands.length === 0) return;
    const base = Math.floor(nights / selectedIslands.length);
    const remainder = nights % selectedIslands.length;
    const dist = {};
    selectedIslands.forEach((id, i) => {
      dist[id] = Math.max(1, base + (i < remainder ? 1 : 0));
    });
    setNightsPerIsland(dist);
  };

  /* --- Interactions --- */
  const toggleIsland = (id) =>
    setSelectedIslands(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const updateActivity = (islandId, activityId, delta) => {
    const key = `${islandId}:${activityId}`;
    setActivityQty(prev => {
      const cur = prev[key] || 0;
      const cap = nightsPerIsland[islandId] || 0;
      const next = Math.max(0, Math.min(cap, cur + delta));
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const canAdvance = () => {
    if (step === 1) return !!packageType;
    if (step === 2) return !!travelMonth;
    if (step === 3) return selectedIslands.length > 0 && selectedIslands.length <= nights;
    if (step === 4) return allocatedOk;
    return true;
  };

  /* --- Derived: grouped activity list for summary --- */
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

  return (
    <div className="min-h-screen w-full" style={{ background: '#f5efe3', fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-display-italic { font-family: 'Fraunces', serif; font-style: italic; }
        .grain { background-image: radial-gradient(rgba(12,52,65,0.04) 1px, transparent 1px); background-size: 4px 4px; }
        .fade-in { animation: fadeIn 0.45s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input[type=range] { -webkit-appearance: none; background: rgba(12,52,65,0.15); height: 3px; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #0c3441; border-radius: 50%; cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; background: #0c3441; border-radius: 50%; cursor: pointer; border: none; }
      `}</style>

      {/* ==========  HEADER  ========== */}
      <header className="border-b" style={{ borderColor: 'rgba(12,52,65,0.12)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#0c3441' }}>
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-xl leading-none" style={{ color: '#0c3441' }}>
                Faru & Co<span className="font-display-italic">.</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: '#7a6f5e' }}>
                Maldives, designed by you
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: '#5a5348' }}>
            <span>Destinations</span>
            <span>Journal</span>
            <span>Contact</span>
            <button className="px-4 py-2 text-white rounded-full text-sm" style={{ background: '#0c3441' }}>Sign in</button>
          </div>
        </div>
      </header>

      {/* ==========  HERO + STEPS  ========== */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#c97b4e' }}>Build your own</div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05]" style={{ color: '#0c3441' }}>
              A vacation, <span className="font-display-italic">shaped</span><br />around you.
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#7a6f5e' }}>
            <MapPin className="w-4 h-4" />
            Based in Malé · 1,192 islands to choose from
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3 border-t border-b py-4" style={{ borderColor: 'rgba(12,52,65,0.12)' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 md:gap-3 flex-1">
              <button onClick={() => s.n < step && setStep(s.n)} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all"
                  style={{
                    background: step >= s.n ? '#0c3441' : 'transparent',
                    border: step >= s.n ? 'none' : '1px solid rgba(12,52,65,0.3)',
                    color: step >= s.n ? '#fff' : '#7a6f5e',
                  }}
                >
                  {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className="text-sm font-medium truncate hidden sm:inline" style={{ color: step >= s.n ? '#0c3441' : '#7a6f5e' }}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && <div className="h-px flex-1" style={{ background: 'rgba(12,52,65,0.15)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ==========  MAIN GRID  ========== */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="fade-in" key={step}>

          {/* ----- STEP 1: PACKAGE ----- */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl mb-2" style={{ color: '#0c3441' }}>Pick your style of stay</h2>
              <p className="mb-8" style={{ color: '#5a5348' }}>Two very different ways to experience the Maldives. Both are beautiful.</p>
              <div className="grid md:grid-cols-2 gap-5">
                {PACKAGES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPackageType(p.id)}
                    className="text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-1 border-2"
                    style={{
                      borderColor: packageType === p.id ? '#0c3441' : 'transparent',
                      background: p.id === 'local' ? '#efe3cc' : '#d8e6e2',
                    }}
                  >
                    <div className="h-48 relative overflow-hidden grain">
                      {p.id === 'local' ? (
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          <defs><linearGradient id="sky1" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="#f8d9a8"/><stop offset="1" stopColor="#efc896"/>
                          </linearGradient></defs>
                          <rect width="400" height="200" fill="url(#sky1)"/>
                          <circle cx="320" cy="60" r="28" fill="#f4a261" opacity="0.8"/>
                          <path d="M0,140 Q100,120 200,135 T400,130 L400,200 L0,200 Z" fill="#e8c792"/>
                          <path d="M0,160 Q100,145 200,155 T400,150 L400,200 L0,200 Z" fill="#d4a574"/>
                          <g transform="translate(60,80)"><rect x="-2" y="0" width="4" height="70" fill="#4a3728"/>
                            <path d="M0,0 Q-25,-10 -40,-5 M0,0 Q25,-10 40,-5 M0,0 Q-15,-25 -25,-30 M0,0 Q15,-25 25,-30" stroke="#3d5941" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                          <g transform="translate(340,90)"><rect x="-2" y="0" width="4" height="60" fill="#4a3728"/>
                            <path d="M0,0 Q-20,-8 -32,-4 M0,0 Q20,-8 32,-4 M0,0 Q-12,-20 -20,-24 M0,0 Q12,-20 20,-24" stroke="#3d5941" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                          <rect x="170" y="110" width="60" height="35" fill="#faf0d7"/>
                          <path d="M165,110 L200,88 L235,110 Z" fill="#8b5a3c"/>
                          <rect x="195" y="125" width="10" height="20" fill="#4a3728"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          <defs><linearGradient id="sky2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0" stopColor="#b8d8d4"/><stop offset="1" stopColor="#7fb5ae"/>
                          </linearGradient></defs>
                          <rect width="400" height="200" fill="url(#sky2)"/>
                          <path d="M0,130 Q200,115 400,130 L400,200 L0,200 Z" fill="#4a8a8a"/>
                          <path d="M0,150 Q200,140 400,150 L400,200 L0,200 Z" fill="#2d6668"/>
                          {[80, 160, 240, 320].map((x, i) => (
                            <g key={i} transform={`translate(${x},110)`}>
                              <rect x="-2" y="20" width="4" height="30" fill="#3a2a1e"/>
                              <rect x="18" y="20" width="4" height="30" fill="#3a2a1e"/>
                              <rect x="-10" y="8" width="34" height="16" fill="#f0e4c8"/>
                              <path d="M-14,8 L7,-6 L28,8 Z" fill="#7a5840"/>
                            </g>
                          ))}
                          <rect x="70" y="125" width="270" height="3" fill="#5a4030"/>
                        </svg>
                      )}
                      {packageType === p.id && (
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#0c3441' }}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#c97b4e' }}>{p.tagline}</div>
                      <h3 className="font-display text-2xl mb-2" style={{ color: '#0c3441' }}>{p.name}</h3>
                      <p className="text-sm mb-4" style={{ color: '#5a5348' }}>{p.description}</p>
                      <div className="text-sm" style={{ color: '#0c3441' }}>
                        from <span className="font-display text-xl">${p.basePerNight}</span>
                        <span style={{ color: '#7a6f5e' }}> / person / night</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ----- STEP 2: DATES + MONTH + GUESTS ----- */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl mb-2" style={{ color: '#0c3441' }}>When, how long, how many?</h2>
              <p className="mb-8" style={{ color: '#5a5348' }}>
                The Maldives has two seasons. Dry (Nov–Apr) is calmer water and blue skies.
                Wet (May–Oct) brings occasional storms but also manta season.
              </p>

              {/* Month picker */}
              <div className="mb-5">
                <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: '#7a6f5e' }}>Travel month</div>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {MONTHS.map(m => {
                    const selected = travelMonth === m.n;
                    return (
                      <button
                        key={m.n}
                        onClick={() => setTravelMonth(m.n)}
                        className="p-2 rounded-lg border transition-all text-center"
                        style={{
                          background: selected ? '#0c3441' : 'white',
                          borderColor: selected ? '#0c3441' : 'rgba(12,52,65,0.12)',
                          color: selected ? 'white' : '#0c3441',
                        }}
                      >
                        <div className="text-xs font-medium">{m.short}</div>
                        <div
                          className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                          style={{ background: m.season === 'dry' ? (selected ? '#f4cc8a' : '#c97b4e') : (selected ? '#7fb5ae' : '#2a9d8f') }}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-5 mt-3 text-xs" style={{ color: '#7a6f5e' }}>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c97b4e' }} />Dry season</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2a9d8f' }} />Wet season</span>
                </div>
              </div>

              {/* Nights */}
              <div className="rounded-2xl p-6 mb-4" style={{ background: '#efe3cc' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: '#7a6f5e' }}>Nights</div>
                    <div className="font-display text-4xl" style={{ color: '#0c3441' }}>{nights}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setNights(n => Math.max(2, n - 1))}
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40"
                      style={{ borderColor: 'rgba(12,52,65,0.2)', color: '#0c3441' }}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={() => setNights(n => Math.min(21, n + 1))}
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40"
                      style={{ borderColor: 'rgba(12,52,65,0.2)', color: '#0c3441' }}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input type="range" min="2" max="21" value={nights} onChange={(e) => setNights(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs mt-2" style={{ color: '#7a6f5e' }}>
                  <span>2 nights</span><span>21 nights</span>
                </div>
              </div>

              {/* Guests */}
              <div className="rounded-2xl p-6" style={{ background: '#d8e6e2' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: '#7a6f5e' }}>Travelers</div>
                    <div className="font-display text-4xl" style={{ color: '#0c3441' }}>{guests}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40"
                      style={{ borderColor: 'rgba(12,52,65,0.2)', color: '#0c3441' }}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={() => setGuests(g => Math.min(12, g + 1))}
                      className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-white/40"
                      style={{ borderColor: 'rgba(12,52,65,0.2)', color: '#0c3441' }}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----- STEP 3: ISLANDS ----- */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl mb-2" style={{ color: '#0c3441' }}>Pick your islands</h2>
              <p className="mb-4" style={{ color: '#5a5348' }}>
                Hop between as many as you like. Each additional island adds a transfer.
              </p>

              {selectedIslands.length > nights && (
                <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm" style={{ background: '#fdecd1', color: '#8a5a2b' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>You've picked more islands than nights. Remove one or add nights in the previous step.</span>
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
                        borderColor: selected ? '#0c3441' : 'rgba(12,52,65,0.12)',
                        background: selected ? '#0c3441' : 'white',
                        color: selected ? 'white' : '#0c3441',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: selected ? 'rgba(255,255,255,0.6)' : '#c97b4e' }}>
                            {island.atoll}
                          </div>
                          <h3 className="font-display text-2xl">{island.name}</h3>
                        </div>
                        <div className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1"
                          style={{ borderColor: selected ? 'white' : 'rgba(12,52,65,0.3)', background: selected ? 'white' : 'transparent' }}>
                          {selected && <Check className="w-3.5 h-3.5" style={{ color: '#0c3441' }} />}
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: selected ? 'rgba(255,255,255,0.8)' : '#5a5348' }}>{island.note}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {island.tags.map(tag => (
                          <span key={tag}
                            className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full"
                            style={{ background: selected ? 'rgba(255,255,255,0.15)' : 'rgba(12,52,65,0.06)', color: selected ? 'white' : '#5a5348' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----- STEP 4: ITINERARY (NIGHT ALLOCATION) ----- */}
          {step === 4 && (
            <div>
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <h2 className="font-display text-3xl" style={{ color: '#0c3441' }}>Plan your nights</h2>
                <button onClick={redistributeEvenly}
                  className="flex items-center gap-1.5 text-xs tracking-wider uppercase px-3 py-2 rounded-full border hover:bg-white/40"
                  style={{ borderColor: 'rgba(12,52,65,0.2)', color: '#0c3441' }}>
                  <Shuffle className="w-3.5 h-3.5" />
                  Split evenly
                </button>
              </div>
              <p className="mb-6" style={{ color: '#5a5348' }}>
                Split your {nights} nights among your {selectedIslands.length} {selectedIslands.length === 1 ? 'island' : 'islands'}.
              </p>

              {/* Allocation bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-2 text-xs tracking-[0.2em] uppercase" style={{ color: '#7a6f5e' }}>
                  <span>Allocated</span>
                  <span style={{ color: allocatedOk ? '#2a9d8f' : '#c97b4e' }}>
                    {allocated} / {nights} {allocated === nights ? '✓' : ''}
                  </span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden" style={{ background: 'rgba(12,52,65,0.08)' }}>
                  {selectedIslands.map((id, i) => {
                    const n = nightsPerIsland[id] || 0;
                    const pct = (n / nights) * 100;
                    const colors = ['#0c3441', '#2a9d8f', '#c97b4e', '#7fb5ae', '#d4a574', '#8b5a3c'];
                    return (
                      <div key={id}
                        className="flex items-center justify-center text-[10px] font-medium text-white transition-all"
                        style={{ width: `${pct}%`, background: colors[i % colors.length] }}>
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
                  const n = nightsPerIsland[id] || 0;
                  const colors = ['#0c3441', '#2a9d8f', '#c97b4e', '#7fb5ae', '#d4a574', '#8b5a3c'];
                  return (
                    <div key={id} className="flex items-center gap-4 p-4 rounded-xl border bg-white"
                      style={{ borderColor: 'rgba(12,52,65,0.12)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0"
                        style={{ background: colors[i % colors.length] }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg" style={{ color: '#0c3441' }}>{island.name}</div>
                        <div className="text-xs flex items-center gap-2" style={{ color: '#7a6f5e' }}>
                          <span>{island.atoll}</span>
                          {i > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Plane className="w-3 h-3" />transfer</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => adjustIslandNights(id, -1)}
                          disabled={n <= 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30"
                          style={{ background: 'rgba(12,52,65,0.08)', color: '#0c3441' }}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="font-display text-xl min-w-[2.5rem] text-center" style={{ color: '#0c3441' }}>
                          {n}<span className="text-xs ml-0.5" style={{ color: '#7a6f5e' }}>n</span>
                        </div>
                        <button onClick={() => adjustIslandNights(id, 1)}
                          disabled={allocated >= nights}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                          style={{ background: '#0c3441' }}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----- STEP 5: ACTIVITIES (GROUPED BY ISLAND) ----- */}
          {step === 5 && (
            <div>
              <h2 className="font-display text-3xl mb-2" style={{ color: '#0c3441' }}>Add experiences</h2>
              <p className="mb-8" style={{ color: '#5a5348' }}>
                Only activities available at each island during <span className="font-medium" style={{ color: '#0c3441' }}>{monthLabel}</span> are shown.
                Seasonal experiences are marked.
              </p>

              <div className="space-y-8">
                {selectedIslands.map((islandId, idx) => {
                  const island = islandById[islandId];
                  const n = nightsPerIsland[islandId] || 0;
                  const dayStart = selectedIslands.slice(0, idx).reduce((a, id) => a + (nightsPerIsland[id] || 0), 0) + 1;
                  const dayEnd = dayStart + n - 1;

                  // Split activities: available/in-season vs available/off-season
                  const inSeason = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && isActivityInSeason(a, travelMonth));
                  const offSeason = ACTIVITIES.filter(a => isActivityAvailableAt(a, islandId) && !isActivityInSeason(a, travelMonth));

                  return (
                    <div key={islandId}>
                      {/* Island header */}
                      <div className="flex items-end justify-between mb-4 pb-3 border-b" style={{ borderColor: 'rgba(12,52,65,0.12)' }}>
                        <div>
                          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: '#c97b4e' }}>
                            Days {dayStart}{n > 1 ? `–${dayEnd}` : ''} · {n} {n === 1 ? 'night' : 'nights'}
                          </div>
                          <h3 className="font-display text-2xl" style={{ color: '#0c3441' }}>
                            {island.name} <span className="font-display-italic text-base" style={{ color: '#7a6f5e' }}>at {island.atoll}</span>
                          </h3>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {inSeason.map(act => {
                          const key = `${islandId}:${act.id}`;
                          const qty = activityQty[key] || 0;
                          const Icon = act.icon;
                          return (
                            <div key={key}
                              className="p-4 rounded-xl flex items-center gap-4 transition-all"
                              style={{
                                background: qty > 0 ? '#d8e6e2' : 'white',
                                border: `1px solid ${qty > 0 ? '#7fb5ae' : 'rgba(12,52,65,0.12)'}`,
                              }}
                            >
                              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: qty > 0 ? '#0c3441' : '#f5efe3' }}>
                                <Icon className="w-5 h-5" style={{ color: qty > 0 ? 'white' : '#0c3441' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm" style={{ color: '#0c3441' }}>{act.name}</div>
                                <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: '#7a6f5e' }}>
                                  <span>${act.price}</span><span>·</span><span>{act.duration}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {qty > 0 && (
                                  <>
                                    <button onClick={() => updateActivity(islandId, act.id, -1)}
                                      className="w-7 h-7 rounded-full flex items-center justify-center"
                                      style={{ background: 'rgba(12,52,65,0.08)', color: '#0c3441' }}>
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-display text-base w-5 text-center" style={{ color: '#0c3441' }}>{qty}</span>
                                  </>
                                )}
                                <button onClick={() => updateActivity(islandId, act.id, 1)}
                                  disabled={qty >= n}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-30"
                                  style={{ background: '#0c3441' }}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {offSeason.map(act => {
                          const Icon = act.icon;
                          const seasonMonths = act.activeMonths.map(n => MONTHS[n-1].short).join(', ');
                          return (
                            <div key={`${islandId}:${act.id}`}
                              className="p-4 rounded-xl flex items-center gap-4 opacity-50"
                              style={{ background: 'white', border: '1px dashed rgba(12,52,65,0.2)' }}>
                              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: '#f5efe3' }}>
                                <Icon className="w-5 h-5" style={{ color: '#0c3441' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm" style={{ color: '#0c3441' }}>{act.name}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#c97b4e' }}>
                                  Season: {seasonMonths}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========  NAV BUTTONS  ========== */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t" style={{ borderColor: 'rgba(12,52,65,0.12)' }}>
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
              className="flex items-center gap-2 text-sm disabled:opacity-30" style={{ color: '#0c3441' }}>
              <ArrowLeft className="w-4 h-4" />Back
            </button>
            {step < 5 ? (
              <button onClick={() => setStep(s => Math.min(5, s + 1))} disabled={!canAdvance()}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium disabled:opacity-30"
                style={{ background: '#0c3441' }}>
                Continue<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium"
                style={{ background: '#c97b4e' }}>
                Request booking<ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ==========  SUMMARY SIDEBAR  ========== */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: 'rgba(12,52,65,0.12)' }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#c97b4e' }}>Your trip</div>

            {!pkg && (
              <div className="py-8 text-center text-sm" style={{ color: '#7a6f5e' }}>
                Start by picking a style of stay.
              </div>
            )}

            {pkg && (
              <>
                <div className="pb-4 mb-4 border-b" style={{ borderColor: 'rgba(12,52,65,0.08)' }}>
                  <div className="font-display text-xl" style={{ color: '#0c3441' }}>{pkg.name}</div>
                  <div className="text-sm mt-1" style={{ color: '#7a6f5e' }}>
                    {monthLabel && <>{monthLabel} · </>}
                    {nights} nights · {guests} {guests === 1 ? 'traveler' : 'travelers'}
                  </div>
                </div>

                {selectedIslands.length > 0 && (
                  <div className="pb-4 mb-4 border-b" style={{ borderColor: 'rgba(12,52,65,0.08)' }}>
                    <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: '#7a6f5e' }}>
                      Itinerary
                    </div>
                    <div className="space-y-2">
                      {selectedIslands.map((id, i) => {
                        const island = islandById[id];
                        const n = nightsPerIsland[id] || 0;
                        const acts = summaryByIsland[id] || [];
                        return (
                          <div key={id}>
                            <div className="flex items-center justify-between text-sm" style={{ color: '#0c3441' }}>
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" style={{ color: '#c97b4e' }} />
                                <span className="font-medium">{island.name}</span>
                              </span>
                              <span className="text-xs" style={{ color: '#7a6f5e' }}>{n}n</span>
                            </div>
                            {acts.length > 0 && (
                              <div className="pl-5 mt-1 space-y-0.5">
                                {acts.map(a => (
                                  <div key={a.key} className="flex justify-between text-xs" style={{ color: '#7a6f5e' }}>
                                    <span>{a.qty}× {a.name}</span>
                                    <span>${a.price * a.qty * guests}</span>
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

                <div className="space-y-1.5 text-sm" style={{ color: '#5a5348' }}>
                  <div className="flex justify-between"><span>Stay</span><span>${stayCost.toLocaleString()}</span></div>
                  {transferCost > 0 && <div className="flex justify-between"><span>Island transfers</span><span>${transferCost.toLocaleString()}</span></div>}
                  {activitiesCost > 0 && <div className="flex justify-between"><span>Experiences</span><span>${activitiesCost.toLocaleString()}</span></div>}
                </div>

                <div className="mt-4 pt-4 border-t flex items-baseline justify-between" style={{ borderColor: 'rgba(12,52,65,0.08)' }}>
                  <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#7a6f5e' }}>Estimated total</span>
                  <span className="font-display text-3xl" style={{ color: '#0c3441' }}>${total.toLocaleString()}</span>
                </div>

                <div className="text-xs mt-3 leading-relaxed" style={{ color: '#7a6f5e' }}>
                  Prices exclude international flights and 16% GST. Final quote confirmed within 24 hours.
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
