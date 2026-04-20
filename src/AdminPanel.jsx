import { useState, useEffect, useMemo } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, updateDoc, doc, query, orderBy,
  onSnapshot, writeBatch, Timestamp, deleteDoc,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  Waves, Search, LogOut, TrendingUp, CheckCircle, Clock,
  XCircle, MessageSquare, Mail, Phone, ChevronDown, ChevronUp,
  Database, MapPin, Star, Users, DollarSign, Inbox, Eye,
  LayoutDashboard, BookOpen, Filter, X, AlertCircle,
} from 'lucide-react';

/* ── theme ── */
const C = {
  navy: '#0c3441', teal: '#2a9d8f', copper: '#c97b4e', coral: '#f4845f',
  gold: '#f9c23c', sand: '#fff9f0', cream: '#fef3d8', seafoam: '#d8f0ec',
  ltTeal: '#7fb5ae', textDark: '#1a2e35', textMid: '#5a5348',
  textLight: '#7a6f5e', border: 'rgba(12,52,65,0.12)',
  borderFaint: 'rgba(12,52,65,0.07)', error: '#e53e3e',
};

const STATUS_META = {
  new:       { label: 'New',       bg: '#fff3e0', color: '#8a5a2b', dot: '#f59e0b' },
  contacted: { label: 'Contacted', bg: '#d8f0ec', color: '#2a9d8f', dot: '#2a9d8f' },
  confirmed: { label: 'Confirmed', bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
  declined:  { label: 'Declined',  bg: '#fce4ec', color: '#c62828', dot: '#ef5350' },
  read:      { label: 'Read',      bg: '#d8f0ec', color: '#2a9d8f', dot: '#2a9d8f' },
  replied:   { label: 'Replied',   bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
};

/* ── seed data ── */
function d(daysAgo) {
  const t = new Date();
  t.setDate(t.getDate() - daysAgo);
  return Timestamp.fromDate(t);
}

const SEED_BOOKINGS = [
  {
    ref: 'FARU-HM8X2P', firstName: 'Sarah', lastName: 'Mitchell',
    email: 'sarah.mitchell@gmail.com', phone: '+1 917 555 0142',
    notes: 'Anniversary trip — please arrange rose petal turndown on arrival night.',
    packageType: 'resort', packageName: 'Private Resort · February',
    nights: 7, guests: 2, travelMonth: 2, monthName: 'February',
    islands: ['baa', 'south-ari'], islandNames: 'Baa Atoll, South Ari',
    nightsPerIsland: { baa: 4, 'south-ari': 3 },
    activityQty: { 'baa:manta': 2, 'south-ari:whaleshark': 1, 'baa:dinner': 1 },
    subtotal: 8000, gst: 1280, total: 9280, status: 'confirmed', createdAt: d(2),
  },
  {
    ref: 'FARU-JK4R9T', firstName: 'James', lastName: 'Sharma',
    email: 'james.sharma@icloud.com', phone: '+44 7700 900142',
    notes: '',
    packageType: 'resort', packageName: 'Private Resort · March',
    nights: 6, guests: 2, travelMonth: 3, monthName: 'March',
    islands: ['noonu'], islandNames: 'Noonu Atoll',
    nightsPerIsland: { noonu: 6 },
    activityQty: { 'noonu:dive': 2, 'noonu:spa': 1 },
    subtotal: 6450, gst: 1032, total: 7482, status: 'confirmed', createdAt: d(5),
  },
  {
    ref: 'FARU-WB3L7M', firstName: 'Marcus', lastName: 'Rodriguez',
    email: 'marcus.rod@outlook.com', phone: '+34 612 345 678',
    notes: 'Certified diver, PADI Advanced. Very interested in the hammerhead dive at Rasdhoo.',
    packageType: 'local', packageName: 'Local Island · June',
    nights: 10, guests: 2, travelMonth: 6, monthName: 'June',
    islands: ['dhigurah', 'rasdhoo', 'maafushi'], islandNames: 'Dhigurah, Rasdhoo, Maafushi',
    nightsPerIsland: { dhigurah: 4, rasdhoo: 3, maafushi: 3 },
    activityQty: { 'dhigurah:whaleshark': 2, 'rasdhoo:dive': 2, 'maafushi:snorkel': 1 },
    subtotal: 2880, gst: 461, total: 3341, status: 'contacted', createdAt: d(7),
  },
  {
    ref: 'FARU-FA5N1K', firstName: 'Priya', lastName: 'Anderson',
    email: 'priya.anderson@gmail.com', phone: '+61 412 000 777',
    notes: 'Family of 4 — 2 adults, 2 kids (8 & 11). Need connecting rooms if possible.',
    packageType: 'local', packageName: 'Local Island · August',
    nights: 8, guests: 4, travelMonth: 8, monthName: 'August',
    islands: ['maafushi', 'hulhumale'], islandNames: 'Maafushi, Hulhumalé',
    nightsPerIsland: { maafushi: 5, hulhumale: 3 },
    activityQty: { 'maafushi:snorkel': 2, 'maafushi:dolphin': 1, 'maafushi:sandbank': 1 },
    subtotal: 4800, gst: 768, total: 5568, status: 'confirmed', createdAt: d(10),
  },
  {
    ref: 'FARU-SS9Y4B', firstName: 'Yuki', lastName: 'Tanaka',
    email: 'yuki.t@surfmail.jp', phone: '+81 90 1234 5678',
    notes: 'Solo surfer. Has own board. Looking for 5 nights at Thulusdhoo for Cokes season.',
    packageType: 'local', packageName: 'Local Island · May',
    nights: 5, guests: 1, travelMonth: 5, monthName: 'May',
    islands: ['thulusdhoo'], islandNames: 'Thulusdhoo',
    nightsPerIsland: { thulusdhoo: 5 },
    activityQty: { 'thulusdhoo:surf': 3 },
    subtotal: 760, gst: 122, total: 882, status: 'new', createdAt: d(1),
  },
  {
    ref: 'FARU-EC2W6F', firstName: 'Emma', lastName: 'Clarke',
    email: 'emma.clarke@hotmail.com', phone: '+353 85 123 4567',
    notes: 'Honeymoon. Prefer sunrise-facing villa.',
    packageType: 'resort', packageName: 'Private Resort · April',
    nights: 6, guests: 2, travelMonth: 4, monthName: 'April',
    islands: ['lhaviyani'], islandNames: 'Lhaviyani',
    nightsPerIsland: { lhaviyani: 6 },
    activityQty: { 'lhaviyani:dinner': 2, 'lhaviyani:spa': 1 },
    subtotal: 6960, gst: 1114, total: 8074, status: 'confirmed', createdAt: d(14),
  },
  {
    ref: 'FARU-AR7C3D', firstName: 'Ahmed', lastName: 'Al-Rashid',
    email: 'ahmed.rashid@business.ae', phone: '+971 50 888 1234',
    notes: '',
    packageType: 'resort', packageName: 'Private Resort · March',
    nights: 4, guests: 2, travelMonth: 3, monthName: 'March',
    islands: ['north-male'], islandNames: 'North Malé',
    nightsPerIsland: { 'north-male': 4 },
    activityQty: { 'north-male:dive': 1, 'north-male:photo': 1 },
    subtotal: 5060, gst: 810, total: 5870, status: 'contacted', createdAt: d(18),
  },
  {
    ref: 'FARU-DW4V8H', firstName: 'David', lastName: 'Wong',
    email: 'david.wong@techfirm.sg', phone: '+65 9123 4567',
    notes: '10th wedding anniversary. Budget approx $10k total.',
    packageType: 'resort', packageName: 'Private Resort · January',
    nights: 8, guests: 2, travelMonth: 1, monthName: 'January',
    islands: ['baa', 'raa'], islandNames: 'Baa Atoll, Raa Atoll',
    nightsPerIsland: { baa: 5, raa: 3 },
    activityQty: { 'baa:manta': 1, 'raa:dive': 2 },
    subtotal: 9200, gst: 1472, total: 10672, status: 'declined', createdAt: d(22),
  },
  {
    ref: 'FARU-RP6A5E', firstName: 'Rania', lastName: 'Hassan',
    email: 'rania.h@livemail.com', phone: '+20 100 555 9876',
    notes: 'Solo female traveller. Safety conscious — any tips on local island etiquette?',
    packageType: 'local', packageName: 'Local Island · July',
    nights: 7, guests: 1, travelMonth: 7, monthName: 'July',
    islands: ['fulidhoo', 'dhigurah'], islandNames: 'Fulidhoo, Dhigurah',
    nightsPerIsland: { fulidhoo: 3, dhigurah: 4 },
    activityQty: { 'fulidhoo:snorkel': 1, 'dhigurah:whaleshark': 2 },
    subtotal: 1540, gst: 246, total: 1786, status: 'new', createdAt: d(3),
  },
  {
    ref: 'FARU-MG1T2N', firstName: 'Carlos', lastName: 'Martinez',
    email: 'c.martinez@grupoverde.mx', phone: '+52 55 5555 1234',
    notes: 'Group of 6 friends. Looking for something fun with activities every day.',
    packageType: 'local', packageName: 'Local Island · December',
    nights: 7, guests: 6, travelMonth: 12, monthName: 'December',
    islands: ['maafushi'], islandNames: 'Maafushi',
    nightsPerIsland: { maafushi: 7 },
    activityQty: { 'maafushi:snorkel': 3, 'maafushi:sunset': 2, 'maafushi:boduberu': 1 },
    subtotal: 5880, gst: 941, total: 6821, status: 'contacted', createdAt: d(28),
  },
  {
    ref: 'FARU-OB8X1Q', firstName: 'Oliver', lastName: 'Bennett',
    email: 'oliver.bennett@gmail.com', phone: '+44 7800 123456',
    notes: 'Honeymoon. She said yes last week! Budget flexible for the right experience.',
    packageType: 'resort', packageName: 'Private Resort · February',
    nights: 9, guests: 2, travelMonth: 2, monthName: 'February',
    islands: ['south-ari'], islandNames: 'South Ari',
    nightsPerIsland: { 'south-ari': 9 },
    activityQty: { 'south-ari:whaleshark': 2, 'south-ari:dinner': 2, 'south-ari:spa': 1 },
    subtotal: 12960, gst: 2074, total: 15034, status: 'new', createdAt: d(0),
  },
  {
    ref: 'FARU-LN3K7R', firstName: 'Lena', lastName: 'Kovacs',
    email: 'lena.kovacs@eumail.hu', phone: '+36 30 123 4567',
    notes: '',
    packageType: 'local', packageName: 'Local Island · November',
    nights: 6, guests: 3, travelMonth: 11, monthName: 'November',
    islands: ['rasdhoo', 'maafushi'], islandNames: 'Rasdhoo, Maafushi',
    nightsPerIsland: { rasdhoo: 3, maafushi: 3 },
    activityQty: { 'rasdhoo:dive': 2, 'maafushi:snorkel': 1 },
    subtotal: 2160, gst: 346, total: 2506, status: 'confirmed', createdAt: d(35),
  },
];

const SEED_CONTACTS = [
  {
    firstName: 'Nina', lastName: 'Okafor', email: 'nina.okafor@yahoo.com',
    subject: 'Honeymoon budget planning',
    message: "Hi! My partner and I are planning our honeymoon for next February. We have a budget of around $8,000 total (flights excluded). Is it possible to do a private resort experience within that budget, or would we be better off doing local islands? We're flexible on the destination but really want that wow factor.",
    status: 'new', createdAt: d(1),
  },
  {
    firstName: 'Tom', lastName: 'Eriksen', email: 'tom.eriksen@nordmail.no',
    subject: 'Whale shark season question',
    message: "Hi, I've been reading about whale shark sightings at Dhigurah. Your site says they're there year-round — is that actually true? I've seen conflicting information online. Planning a trip in October. Also, is a snorkel enough or do we need to be certified divers to get close?",
    status: 'read', createdAt: d(4),
  },
  {
    firstName: 'Bridget', lastName: 'Carney', email: 'b.carney@corptravel.ie',
    subject: 'Corporate retreat inquiry — 18 people',
    message: "Hello, I'm a travel coordinator planning an executive retreat for 18 people in April. We need full-board accommodation, meeting space, and a team activity like snorkeling or sandbank picnic. Could you advise on which resort atolls can accommodate a group this size? Budget is approximately $2,000 per person.",
    status: 'replied', createdAt: d(8),
  },
  {
    firstName: 'Hassan', lastName: 'Mirza', email: 'hassan.mirza@gmail.com',
    subject: 'Accessibility question',
    message: "I use a wheelchair and am wondering if any of the local islands are reasonably accessible. Specifically, can someone in a wheelchair board a speedboat transfer? And are there local island guesthouses with ground-floor rooms? Would really love to visit but want to understand what's realistic before booking.",
    status: 'new', createdAt: d(2),
  },
  {
    firstName: 'Claudia', lastName: 'Ferreira', email: 'claudia.f@imail.br',
    subject: 'Best surf spots — October?',
    message: "Oi! I surf intermediate level and want to visit in October. I saw Thulusdhoo mentioned on your site for surfing. Is the Cokes break suitable for intermediate surfers or is it really advanced only? Also, are there any other islands in your network that might be better for my level?",
    status: 'new', createdAt: d(0),
  },
];

async function seedDemoData() {
  const batch = writeBatch(db);
  for (const b of SEED_BOOKINGS) {
    batch.set(doc(collection(db, 'bookings')), b);
  }
  for (const c of SEED_CONTACTS) {
    batch.set(doc(collection(db, 'contacts')), c);
  }
  await batch.commit();
}

/* ── helpers ── */
const fmt = n => n?.toLocaleString('en-US') ?? '0';
const fmtDate = ts => ts?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';
const fmtDateShort = ts => ts?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '—';
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── StatCard ── */
function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: bg || 'white', border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: C.textLight }}>{label}</div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="font-display text-3xl leading-none" style={{ color: C.navy }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: C.textLight }}>{sub}</div>}
    </div>
  );
}

/* ── RevenueChart ── */
function RevenueChart({ bookings }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
  });
  const data = {};
  months.forEach(m => { data[m.key] = 0; });
  bookings.filter(b => b.status === 'confirmed').forEach(b => {
    const dt = b.createdAt?.toDate?.();
    if (!dt) return;
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    if (key in data) data[key] += b.total || 0;
  });
  const max = Math.max(...Object.values(data), 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-28 mb-2">
        {months.map(m => {
          const val = data[m.key] || 0;
          const pct = Math.max((val / max) * 100, val > 0 ? 4 : 0);
          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              {val > 0 && <div className="text-[9px] font-semibold" style={{ color: C.teal }}>${(val / 1000).toFixed(1)}k</div>}
              <div className="w-full rounded-t-lg transition-all" style={{ height: `${pct}%`, background: val > 0 ? C.teal : C.borderFaint, minHeight: 3 }} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {months.map(m => (
          <div key={m.key} className="flex-1 text-center text-[10px]" style={{ color: C.textLight }}>{m.label}</div>
        ))}
      </div>
    </div>
  );
}

/* ── StatusBadge ── */
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

/* ── StatusButtons ── */
function StatusButtons({ current, options, onSet }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(s => {
        const m = STATUS_META[s];
        const active = current === s;
        return (
          <button key={s} onClick={() => onSet(s)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-all"
            style={{ background: active ? m.color : m.bg, color: active ? 'white' : m.color }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN ADMIN PANEL
══════════════════════════════════════════════════ */
export default function AdminPanel({ onBack }) {
  const [authUser, setAuthUser]         = useState(null);
  const [authChecked, setAuthChecked]   = useState(false);
  const [loginEmail, setLoginEmail]     = useState('');
  const [loginPw, setLoginPw]           = useState('');
  const [loginErr, setLoginErr]         = useState('');
  const [loginBusy, setLoginBusy]       = useState(false);

  const [tab, setTab]                   = useState('overview');
  const [bookings, setBookings]         = useState([]);
  const [contacts, setContacts]         = useState([]);
  const [expanded, setExpanded]         = useState(null);

  const [bSearch, setBSearch]           = useState('');
  const [bFilter, setBFilter]           = useState('all');
  const [cSearch, setCSearch]           = useState('');
  const [cFilter, setCFilter]           = useState('all');

  const [seeding, setSeeding]           = useState(false);
  const [seedDone, setSeedDone]         = useState(false);

  /* auth */
  useEffect(() => onAuthStateChanged(auth, u => { setAuthUser(u); setAuthChecked(true); }), []);

  /* real-time data */
  useEffect(() => {
    if (!authUser) return;
    const u1 = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')),
      s => setContacts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, [authUser]);

  /* derived stats */
  const stats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const revenue   = confirmed.reduce((s, b) => s + (b.total || 0), 0);
    const avgVal    = confirmed.length ? Math.round(revenue / confirmed.length) : 0;
    return {
      total:      bookings.length,
      newB:       bookings.filter(b => b.status === 'new').length,
      contacted:  bookings.filter(b => b.status === 'contacted').length,
      confirmed:  confirmed.length,
      declined:   bookings.filter(b => b.status === 'declined').length,
      revenue, avgVal,
      newC:       contacts.filter(c => c.status === 'new').length,
      totalC:     contacts.length,
    };
  }, [bookings, contacts]);

  /* filtered lists */
  const filteredBookings = useMemo(() => {
    const q = bSearch.toLowerCase();
    return bookings.filter(b => {
      const matchStatus = bFilter === 'all' || b.status === bFilter;
      const matchSearch = !q || [b.firstName, b.lastName, b.email, b.ref, b.islandNames]
        .some(v => v?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [bookings, bSearch, bFilter]);

  const filteredContacts = useMemo(() => {
    const q = cSearch.toLowerCase();
    return contacts.filter(c => {
      const matchStatus = cFilter === 'all' || c.status === cFilter;
      const matchSearch = !q || [c.firstName, c.lastName, c.email, c.subject]
        .some(v => v?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [contacts, cSearch, cFilter]);

  /* handlers */
  const login = async e => {
    e.preventDefault(); setLoginBusy(true); setLoginErr('');
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPw); }
    catch { setLoginErr('Invalid email or password.'); }
    finally { setLoginBusy(false); }
  };

  const setBookingStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'bookings', id), { status }); } catch {}
  };

  const setContactStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'contacts', id), { status }); } catch {}
  };

  const toggle = id => setExpanded(prev => prev === id ? null : id);

  const handleSeed = async () => {
    setSeeding(true);
    try { await seedDemoData(); setSeedDone(true); setTab('bookings'); }
    catch (e) { alert('Seed failed: ' + e.message); }
    finally { setSeeding(false); }
  };

  /* ── loading ── */
  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.sand }}>
      <div className="text-sm" style={{ color: C.textLight }}>Loading…</div>
    </div>
  );

  /* ── login ── */
  if (!authUser) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: C.navy }}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div className="font-display text-2xl" style={{ color: C.navy }}>Admin Panel</div>
          <div className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: C.textLight }}>Faru & Co · Maldives</div>
        </div>
        <form onSubmit={login} className="rounded-3xl p-8" style={{ background: 'white', boxShadow: '0 8px 40px rgba(12,52,65,0.12)' }}>
          {[
            ['email', 'Email address', loginEmail, setLoginEmail, 'email', 'email', 'admin@faru.co'],
            ['password', 'Password', loginPw, setLoginPw, 'password', 'current-password', '••••••••'],
          ].map(([type, label, val, set, itype, ac, ph]) => (
            <div key={type} className="mb-4">
              <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
              <input type={itype} value={val} onChange={e => set(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
                placeholder={ph} autoComplete={ac} />
            </div>
          ))}
          {loginErr && <p className="text-xs mb-4 text-center flex items-center justify-center gap-1.5" style={{ color: C.error }}>
            <AlertCircle className="w-3.5 h-3.5" />{loginErr}
          </p>}
          <button type="submit" disabled={loginBusy}
            className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold mt-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
            style={{ background: C.navy }}>
            {loginBusy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <button onClick={onBack} className="block mx-auto mt-4 text-xs" style={{ color: C.textLight }}>← Back to site</button>
      </div>
    </div>
  );

  /* ══════ DASHBOARD ══════ */
  return (
    <div className="min-h-screen" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>

      {/* Header */}
      <div className="border-b sticky top-0 z-30" style={{ background: 'white', borderColor: C.border }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.navy }}>
              <Waves className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-display text-lg leading-none" style={{ color: C.navy }}>Faru & Co</div>
              <div className="text-[9px] tracking-[0.25em] uppercase" style={{ color: C.coral }}>Admin</div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              ['overview', 'Overview', LayoutDashboard],
              ['bookings', 'Bookings', BookOpen],
              ['messages', 'Messages', MessageSquare],
            ].map(([t, label, Icon]) => (
              <button key={t} onClick={() => { setTab(t); setExpanded(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: tab === t ? 'white' : 'transparent', color: tab === t ? C.navy : C.textLight, boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                {t === 'bookings' && stats.newB > 0 && <span className="ml-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: C.coral }}>{stats.newB}</span>}
                {t === 'messages' && stats.newC > 0 && <span className="ml-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: C.coral }}>{stats.newC}</span>}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs hidden lg:block" style={{ color: C.textLight }}>{authUser.email}</span>
            <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-full border hidden md:block transition-colors hover:bg-gray-50" style={{ borderColor: C.border, color: C.textMid }}>
              ← Site
            </button>
            <button onClick={() => signOut(auth)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: C.border, color: C.textMid }}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-t" style={{ borderColor: C.border }}>
          {[['overview','Overview',LayoutDashboard],['bookings','Bookings',BookOpen],['messages','Messages',MessageSquare]].map(([t,label,Icon]) => (
            <button key={t} onClick={() => { setTab(t); setExpanded(null); }} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold"
              style={{ color: tab === t ? C.navy : C.textLight, borderBottom: tab === t ? `2px solid ${C.navy}` : '2px solid transparent' }}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Overview</h1>
                <p className="text-sm" style={{ color: C.textLight }}>Real-time snapshot of your business</p>
              </div>
              <button onClick={handleSeed} disabled={seeding || seedDone}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50"
                style={{ borderColor: C.border, color: seedDone ? C.teal : C.textMid, background: 'white' }}>
                <Database className="w-3.5 h-3.5" />
                {seeding ? 'Loading…' : seedDone ? 'Demo data loaded ✓' : 'Load demo data'}
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Inbox}       label="Total Requests"  value={stats.total}             sub={`${stats.newB} new · ${stats.contacted} in progress`} color={C.navy}   />
              <StatCard icon={AlertCircle} label="Needs Response"  value={stats.newB}              sub="uncontacted requests" color={C.coral}  />
              <StatCard icon={CheckCircle} label="Confirmed Trips" value={stats.confirmed}          sub={`${stats.declined} declined`}         color={C.teal}   />
              <StatCard icon={DollarSign}  label="Confirmed Revenue" value={`$${fmt(stats.revenue)}`} sub={`avg $${fmt(stats.avgVal)} / trip`}   color={C.copper} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Revenue chart */}
              <div className="md:col-span-2 rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-sm" style={{ color: C.navy }}>Confirmed Revenue</div>
                    <div className="text-xs" style={{ color: C.textLight }}>Last 6 months</div>
                  </div>
                  <TrendingUp className="w-4 h-4" style={{ color: C.teal }} />
                </div>
                <RevenueChart bookings={bookings} />
              </div>

              {/* Status breakdown */}
              <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                <div className="font-semibold text-sm mb-4" style={{ color: C.navy }}>Booking Status</div>
                <div className="space-y-3">
                  {[
                    ['new',       'New',       stats.newB],
                    ['contacted', 'Contacted', stats.contacted],
                    ['confirmed', 'Confirmed', stats.confirmed],
                    ['declined',  'Declined',  stats.declined],
                  ].map(([s, label, count]) => {
                    const m = STATUS_META[s];
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: C.textMid }}>{label}</span>
                          <span style={{ color: C.textLight }}>{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full w-full" style={{ background: C.borderFaint }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.dot }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.borderFaint }}>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.textLight }}>Messages</span>
                    <span style={{ color: C.textMid }}>{stats.totalC} total · {stats.newC} unread</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: `1px solid ${C.border}` }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.borderFaint }}>
                <div className="font-semibold text-sm" style={{ color: C.navy }}>Recent Requests</div>
                <button onClick={() => setTab('bookings')} className="text-xs font-semibold" style={{ color: C.coral }}>View all →</button>
              </div>
              {bookings.slice(0, 5).map((b, i) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: i < 4 ? `1px solid ${C.borderFaint}` : 'none' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: ['new','contacted','confirmed','declined'].indexOf(b.status) % 2 === 0 ? C.navy : C.teal }}>
                    {b.firstName?.[0]}{b.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: C.navy }}>{b.firstName} {b.lastName}</div>
                    <div className="text-xs truncate" style={{ color: C.textLight }}>{b.packageName}</div>
                  </div>
                  <div className="text-sm font-display hidden sm:block" style={{ color: C.navy }}>${fmt(b.total)}</div>
                  <StatusBadge status={b.status} />
                  <div className="text-xs hidden md:block" style={{ color: C.textLight }}>{fmtDateShort(b.createdAt)}</div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-sm" style={{ color: C.textLight }}>No bookings yet. Load demo data to preview.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {tab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Booking Requests</h1>
                <p className="text-sm" style={{ color: C.textLight }}>{stats.total} total · {stats.newB} need response</p>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }} />
                <input value={bSearch} onChange={e => setBSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit', background: 'white' }}
                  placeholder="Search by name, email, ref, island…" />
                {bSearch && <button onClick={() => setBSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }}><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[['all','All'],['new','New'],['contacted','Contacted'],['confirmed','Confirmed'],['declined','Declined']].map(([v,l]) => (
                  <button key={v} onClick={() => setBFilter(v)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: bFilter === v ? C.navy : 'white', color: bFilter === v ? 'white' : C.textMid, border: `1px solid ${bFilter === v ? C.navy : C.border}` }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking rows */}
            <div className="space-y-2">
              {filteredBookings.length === 0 && (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm" style={{ color: C.textLight }}>No bookings match your search.</p>
                </div>
              )}
              {filteredBookings.map(b => {
                const exp = expanded === b.id;
                return (
                  <div key={b.id} className="rounded-2xl overflow-hidden transition-shadow" style={{ background: 'white', border: `1px solid ${C.border}`, boxShadow: exp ? '0 4px 16px rgba(12,52,65,0.08)' : 'none' }}>

                    {/* Row header */}
                    <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => toggle(b.id)}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.navy }}>
                        {b.firstName?.[0]}{b.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                        <div className="min-w-0 col-span-2 md:col-span-1">
                          <div className="font-semibold text-sm truncate" style={{ color: C.navy }}>{b.firstName} {b.lastName}</div>
                          <div className="text-xs" style={{ color: C.textLight }}>{b.ref}</div>
                        </div>
                        <div className="text-xs truncate hidden md:block" style={{ color: C.textMid }}>{b.islandNames}</div>
                        <div className="text-xs hidden md:block" style={{ color: C.textMid }}>{b.nights}n · {b.guests} guest{b.guests !== 1 ? 's' : ''}</div>
                        <div className="font-display text-xl hidden md:block" style={{ color: C.navy }}>${fmt(b.total)}</div>
                        <div className="flex items-center justify-end gap-2">
                          <StatusBadge status={b.status} />
                          {exp ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: C.textLight }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.textLight }} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {exp && (
                      <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: C.borderFaint }}>
                        <div className="grid md:grid-cols-3 gap-5 mb-5">

                          {/* Contact */}
                          <div className="rounded-xl p-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: C.textLight }}>Contact</div>
                            <div className="text-sm font-semibold mb-1" style={{ color: C.navy }}>{b.firstName} {b.lastName}</div>
                            <div className="text-xs mb-3" style={{ color: C.textLight }}>{fmtDate(b.createdAt)}</div>
                            <div className="space-y-2">
                              <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: C.teal }}>
                                <Mail className="w-3.5 h-3.5 shrink-0" />{b.email}
                              </a>
                              <a href={`https://wa.me/${b.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-xs hover:underline" style={{ color: C.teal }}>
                                <Phone className="w-3.5 h-3.5 shrink-0" />{b.phone}
                              </a>
                            </div>
                            {b.notes && (
                              <div className="mt-3 p-2.5 rounded-lg text-xs leading-relaxed italic" style={{ background: C.cream, color: C.textMid }}>
                                "{b.notes}"
                              </div>
                            )}
                          </div>

                          {/* Trip */}
                          <div className="rounded-xl p-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: C.textLight }}>Trip</div>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center gap-2" style={{ color: C.navy }}>
                                <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: C.coral }} />
                                {b.packageName}
                              </div>
                              <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}>
                                <Users className="w-3.5 h-3.5 shrink-0" />
                                {b.nights} nights · {b.guests} guest{b.guests !== 1 ? 's' : ''}
                              </div>
                              {b.islandNames && (
                                <div className="flex items-center gap-2 text-xs" style={{ color: C.textMid }}>
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />{b.islandNames}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="rounded-xl p-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: C.textLight }}>Pricing</div>
                            <div className="space-y-1.5 text-xs" style={{ color: C.textMid }}>
                              <div className="flex justify-between"><span>Subtotal</span><span>${fmt(b.subtotal)}</span></div>
                              <div className="flex justify-between"><span>GST (16%)</span><span>+${fmt(b.gst)}</span></div>
                              <div className="flex justify-between pt-1.5 border-t font-bold text-sm" style={{ borderColor: C.border, color: C.navy }}>
                                <span>Total</span><span className="font-display text-xl">${fmt(b.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.textLight }}>Update Status</div>
                            <StatusButtons current={b.status} options={['new','contacted','confirmed','declined']} onSet={s => setBookingStatus(b.id, s)} />
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <a href={`mailto:${b.email}?subject=Your Faru %26 Co booking request (${b.ref})&body=Hi ${b.firstName},%0D%0A%0D%0AThank you for your booking request.`}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                              style={{ background: C.teal }}>
                              <Mail className="w-3.5 h-3.5" /> Email
                            </a>
                            <a href={`https://wa.me/${b.phone?.replace(/\D/g, '')}?text=Hi ${b.firstName}, this is Faru %26 Co regarding your booking request ${b.ref}.`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                              style={{ background: '#25D366' }}>
                              <Phone className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ MESSAGES TAB ═══ */}
        {tab === 'messages' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Messages</h1>
                <p className="text-sm" style={{ color: C.textLight }}>{stats.totalC} total · {stats.newC} unread</p>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }} />
                <input value={cSearch} onChange={e => setCSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit', background: 'white' }}
                  placeholder="Search by name, email, subject…" />
                {cSearch && <button onClick={() => setCSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textLight }}><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex gap-1.5">
                {[['all','All'],['new','New'],['read','Read'],['replied','Replied']].map(([v,l]) => (
                  <button key={v} onClick={() => setCFilter(v)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: cFilter === v ? C.navy : 'white', color: cFilter === v ? 'white' : C.textMid, border: `1px solid ${cFilter === v ? C.navy : C.border}` }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredContacts.length === 0 && (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-sm" style={{ color: C.textLight }}>No messages match your search.</p>
                </div>
              )}
              {filteredContacts.map(c => {
                const exp = expanded === c.id;
                return (
                  <div key={c.id} className="rounded-2xl overflow-hidden transition-shadow" style={{ background: 'white', border: `1px solid ${C.border}`, boxShadow: exp ? '0 4px 16px rgba(12,52,65,0.08)' : 'none' }}>
                    <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none" onClick={() => toggle(c.id)}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.teal }}>
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate" style={{ color: C.navy }}>{c.firstName} {c.lastName}</div>
                          <div className="text-xs truncate" style={{ color: C.textLight }}>{c.email}</div>
                        </div>
                        <div className="text-sm truncate hidden md:block" style={{ color: C.textMid }}>{c.subject}</div>
                        <div className="text-xs hidden md:block" style={{ color: C.textLight }}>{fmtDateShort(c.createdAt)}</div>
                        <div className="flex items-center justify-end gap-2">
                          <StatusBadge status={c.status} />
                          {exp ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: C.textLight }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: C.textLight }} />}
                        </div>
                      </div>
                    </div>

                    {exp && (
                      <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: C.borderFaint }}>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="rounded-xl p-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.textLight }}>From</div>
                            <div className="font-semibold text-sm mb-1" style={{ color: C.navy }}>{c.firstName} {c.lastName}</div>
                            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs hover:underline mb-1" style={{ color: C.teal }}>
                              <Mail className="w-3.5 h-3.5" />{c.email}
                            </a>
                            <div className="text-xs" style={{ color: C.textLight }}>{fmtDate(c.createdAt)}</div>
                          </div>
                          <div className="md:col-span-2 rounded-xl p-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.textLight }}>Message — {c.subject}</div>
                            <p className="text-sm leading-relaxed" style={{ color: C.textMid }}>{c.message}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: C.textLight }}>Update Status</div>
                            <StatusButtons current={c.status} options={['new','read','replied']} onSet={s => setContactStatus(c.id, s)} />
                          </div>
                          <a href={`mailto:${c.email}?subject=Re: ${c.subject}`}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                            style={{ background: C.teal }}>
                            <Mail className="w-3.5 h-3.5" /> Reply via Email
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
