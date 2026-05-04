import { useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection, addDoc, setDoc, updateDoc, doc, getDocs, query, orderBy,
  onSnapshot, writeBatch, Timestamp, deleteDoc, increment,
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import {
  Waves, Search, LogOut, TrendingUp, CheckCircle, Clock,
  XCircle, MessageSquare, Mail, Phone, ChevronDown, ChevronUp,
  Database, MapPin, Star, Users, DollarSign, Inbox, Eye,
  LayoutDashboard, BookOpen, Filter, X, AlertCircle,
  Settings, Grid, Edit2, Save, ToggleLeft, ToggleRight,
  Package, Sliders, Tag, RefreshCw, Globe, ChevronRight,
  Trash2, Plus, UserPlus, Shield, ShieldOff,
} from 'lucide-react';
import { seedAllCollections } from './seedData';

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
  for (const b of SEED_BOOKINGS) batch.set(doc(collection(db, 'bookings')), b);
  for (const c of SEED_CONTACTS) batch.set(doc(collection(db, 'contacts')), c);
  await batch.commit();
}

/* ── helpers ── */
const fmt = n => n?.toLocaleString('en-US') ?? '0';
const fmtDate = ts => ts?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—';
const fmtDateShort = ts => ts?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? '—';
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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

/* ── InlineInput ── */
function InlineInput({ value, onSave, prefix = '$', type = 'number', min, max, className = '' }) {
  const [local, setLocal] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  useEffect(() => { setLocal(String(value ?? '')); }, [value]);

  const save = async () => {
    const parsed = type === 'number' ? parseFloat(local) : local;
    if (type === 'number' && (isNaN(parsed) || parsed < 0)) { setLocal(String(value)); return; }
    if (parsed === value) return;
    setSaving(true);
    try { await onSave(parsed); } finally { setSaving(false); }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {prefix && <span className="text-xs" style={{ color: C.textLight }}>{prefix}</span>}
      <input
        ref={ref}
        type={type}
        value={local}
        min={min}
        max={max}
        onChange={e => setLocal(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') ref.current?.blur(); if (e.key === 'Escape') { setLocal(String(value)); ref.current?.blur(); } }}
        className="w-16 text-xs font-semibold text-center rounded-lg px-1.5 py-1 border transition-all focus:outline-none"
        style={{ borderColor: C.border, color: C.navy, background: saving ? C.seafoam : 'white' }}
      />
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
  const [islands, setIslands]           = useState([]);
  const [activities, setActivities]     = useState([]);
  const [packages, setPackages]         = useState([]);
  const [settings, setSettings]         = useState(null);
  const [expanded, setExpanded]         = useState(null);

  const [bSearch, setBSearch]           = useState('');
  const [bFilter, setBFilter]           = useState('all');
  const [cSearch, setCSearch]           = useState('');
  const [cFilter, setCFilter]           = useState('all');

  const [seeding, setSeeding]           = useState(false);
  const [seedDone, setSeedDone]         = useState(false);

  const [settingsForm, setSettingsForm] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved]   = useState(false);

  const [pkgEdit, setPkgEdit]           = useState(null);
  const [pkgSaving, setPkgSaving]       = useState(false);

  const [properties, setProperties]     = useState([]);
  const [experiences, setExperiences]   = useState([]);
  const [catalogView, setCatalogView]   = useState('resort');
  const [addIslandOpen, setAddIslandOpen]     = useState(false);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addExpOpen, setAddExpOpen]           = useState(null); // propertyId | null
  const [expandedPropExp, setExpandedPropExp] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm]     = useState(null); // { type, id, name }
  const BLANK_ISLAND    = { name:'', atoll:'', zone:'', note:'', tags:'', packageType:'local', basePerNight:80, image:'/images/local-island.png', active:true };
  const BLANK_PROPERTY  = { name:'', islandName:'', atoll:'', pricePerNight:100, tags:[], note:'', packageType:'resort', active:true };
  const BLANK_EXP       = { name:'', iconName:'Fish', duration:'', defaultPrice:50, activeMonths:[1,2,3,4,5,6,7,8,9,10,11,12], active:true };
  const BLANK_PKG       = { name:'', tagline:'', badge:'', badgeColor:'#f4845f', accentColor:'#c97b4e', packageType:'local', nights:7, guests:2, month:1, islands:[], highlights:['','',''], image:'/images/honeymoon.png', active:true };
  const [newIsland, setNewIsland]       = useState(BLANK_ISLAND);
  const [newProperty, setNewProperty]   = useState(BLANK_PROPERTY);
  const [newExp, setNewExp]             = useState(BLANK_EXP);
  const [addSaving, setAddSaving]       = useState(false);
  const [pkgModal, setPkgModal]         = useState(null); // null | { mode:'create'|'edit', data:{...} }
  const [pkgModalSaving, setPkgModalSaving] = useState(false);
  const [deletePkgConfirm, setDeletePkgConfirm] = useState(null);

  const [adminUsers, setAdminUsers]         = useState([]);
  const [addAdminOpen, setAddAdminOpen]     = useState(false);
  const [newAdmin, setNewAdmin]             = useState({ email:'', displayName:'', password:'', role:'admin' });
  const [addAdminSaving, setAddAdminSaving] = useState(false);
  const [addAdminErr, setAddAdminErr]       = useState('');
  const [removeAdminConfirm, setRemoveAdminConfirm] = useState(null);

  /* auth */
  useEffect(() => onAuthStateChanged(auth, u => { setAuthUser(u); setAuthChecked(true); }), []);

  /* real-time data */
  useEffect(() => {
    if (!authUser) return;
    const u1 = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')),
      s => setContacts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(query(collection(db, 'islands'), orderBy('sortOrder')),
      s => setIslands(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(query(collection(db, 'activities'), orderBy('sortOrder')),
      s => setActivities(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u5 = onSnapshot(query(collection(db, 'curatedPackages'), orderBy('sortOrder')),
      s => setPackages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u6 = onSnapshot(doc(db, 'settings', 'app'),
      d => { if (d.exists()) { const data = d.data(); setSettings(data); setSettingsForm(f => f ?? data); } });
    const u7 = onSnapshot(query(collection(db, 'admins'), orderBy('createdAt', 'asc')),
      s => setAdminUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u8 = onSnapshot(query(collection(db, 'properties'), orderBy('sortOrder')),
      s => setProperties(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u9 = onSnapshot(query(collection(db, 'experiences'), orderBy('sortOrder')),
      s => setExperiences(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8(); u9(); };
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
    try {
      await seedDemoData();
      await seedAllCollections();
      setSeedDone(true); setTab('bookings');
    } catch (e) { alert('Seed failed: ' + e.message); }
    finally { setSeeding(false); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL data from Firestore? This cannot be undone.')) return;
    setSeeding(true);
    try {
      const colls = ['bookings','contacts','islands','activities','curatedPackages','properties','experiences'];
      for (const coll of colls) {
        const snap = await getDocs(collection(db, coll));
        const b = writeBatch(db);
        snap.docs.forEach(d => b.delete(d.ref));
        if (snap.docs.length) await b.commit();
      }
      setSeedDone(false);
    } catch (e) { alert('Delete failed: ' + e.message); }
    finally { setSeeding(false); }
  };

  const updateIsland = async (id, field, val) => {
    await updateDoc(doc(db, 'islands', id), { [field]: val });
  };

  const updateActivityPrice = async (actId, islandId, price) => {
    await updateDoc(doc(db, 'activities', actId), { [`prices.${islandId}`]: price });
  };

  const updateActivityDefault = async (actId, val) => {
    await updateDoc(doc(db, 'activities', actId), { defaultPrice: val });
  };

  const toggleActivityActive = async (actId, current) => {
    await updateDoc(doc(db, 'activities', actId), { active: !current });
  };

  const togglePackageActive = async (pkgId, current) => {
    await updateDoc(doc(db, 'curatedPackages', pkgId), { active: !current });
  };

  const saveSettings = async e => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'app'), {
        gstRate:             parseFloat(settingsForm.gstRate),
        transferCostLocal:   parseFloat(settingsForm.transferCostLocal),
        transferCostResort:  parseFloat(settingsForm.transferCostResort),
        maxNights:           parseInt(settingsForm.maxNights),
        minNights:           parseInt(settingsForm.minNights),
        maxGuests:           parseInt(settingsForm.maxGuests),
        contactEmail:        settingsForm.contactEmail,
        whatsapp:            settingsForm.whatsapp,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } finally { setSettingsSaving(false); }
  };

  const savePkgEdit = async () => {
    if (!pkgEdit) return;
    setPkgSaving(true);
    try {
      const { id, ...data } = pkgEdit;
      await updateDoc(doc(db, 'curatedPackages', id), data);
      setPkgEdit(null);
    } finally { setPkgSaving(false); }
  };

  const savePkgModal = async () => {
    if (!pkgModal) return;
    setPkgModalSaving(true);
    try {
      const d = pkgModal.data;
      if (!d.name.trim()) return;
      if (pkgModal.mode === 'create') {
        const id = slugify(d.name);
        const batch = writeBatch(db);
        batch.set(doc(db, 'curatedPackages', id), {
          ...d, id,
          nights: parseInt(d.nights) || 7,
          guests: parseInt(d.guests) || 2,
          month: parseInt(d.month) || 1,
          sortOrder: packages.length + 1,
          stats: { clicks: 0, bookings: 0 },
        });
        await batch.commit();
      } else {
        const { id, ...rest } = d;
        await updateDoc(doc(db, 'curatedPackages', id), {
          ...rest,
          nights: parseInt(rest.nights) || 7,
          guests: parseInt(rest.guests) || 2,
          month: parseInt(rest.month) || 1,
        });
      }
      setPkgModal(null);
    } catch(e) { alert('Error: ' + e.message); }
    finally { setPkgModalSaving(false); }
  };

  const deletePkg = async () => {
    if (!deletePkgConfirm) return;
    try { await deleteDoc(doc(db, 'curatedPackages', deletePkgConfirm.id)); }
    catch(e) { alert('Error: ' + e.message); }
    finally { setDeletePkgConfirm(null); }
  };

  const addAdminUser = async () => {
    setAddAdminErr('');
    if (!newAdmin.email.trim() || !newAdmin.password.trim()) {
      setAddAdminErr('Email and password are required.'); return;
    }
    if (newAdmin.password.length < 6) {
      setAddAdminErr('Password must be at least 6 characters.'); return;
    }
    setAddAdminSaving(true);
    try {
      // Use a secondary app instance so current admin session isn't replaced
      const secondaryAppName = 'admin-creator';
      const existingApps = getApps();
      const secondaryApp = existingApps.find(a => a.name === secondaryAppName)
        ?? initializeApp(auth.app.options, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const { user } = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email.trim(), newAdmin.password);
      await secondaryAuth.signOut();

      // Store admin record in Firestore
      const batch = writeBatch(db);
      batch.set(doc(db, 'admins', user.uid), {
        uid: user.uid,
        email: newAdmin.email.trim().toLowerCase(),
        displayName: newAdmin.displayName.trim() || newAdmin.email.split('@')[0],
        role: newAdmin.role,
        createdAt: Timestamp.now(),
        createdBy: authUser.email,
      });
      await batch.commit();

      setNewAdmin({ email:'', displayName:'', password:'', role:'admin' });
      setAddAdminOpen(false);
    } catch(e) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : e.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : e.message;
      setAddAdminErr(msg);
    } finally { setAddAdminSaving(false); }
  };

  const removeAdminUser = async () => {
    if (!removeAdminConfirm) return;
    try { await deleteDoc(doc(db, 'admins', removeAdminConfirm.id)); }
    catch(e) { alert('Error: ' + e.message); }
    finally { setRemoveAdminConfirm(null); }
  };

  const slugify = str => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addIsland = async () => {
    if (!newIsland.name.trim()) return;
    setAddSaving(true);
    try {
      const id = slugify(newIsland.name);
      const tagsArr = newIsland.tags ? newIsland.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const batch = writeBatch(db);
      batch.set(doc(db, 'islands', id), {
        id, name: newIsland.name.trim(), atoll: newIsland.atoll.trim(),
        zone: slugify(newIsland.zone || newIsland.atoll || newIsland.name),
        note: newIsland.note.trim(), tags: tagsArr,
        packageType: newIsland.packageType,
        basePerNight: parseFloat(newIsland.basePerNight) || 80,
        image: newIsland.image || '/images/local-island.png',
        active: true, sortOrder: islands.length + 1,
      });
      await batch.commit();
      setNewIsland(BLANK_ISLAND);
      setAddIslandOpen(false);
    } catch(e) { alert('Error: ' + e.message); }
    finally { setAddSaving(false); }
  };


  const deleteItem = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, deleteConfirm.type, deleteConfirm.id));
    } catch(e) { alert('Error: ' + e.message); }
    finally { setDeleteConfirm(null); }
  };

  const updateProperty = async (id, field, val) => {
    await updateDoc(doc(db, 'properties', id), { [field]: val });
  };

  const addProperty = async () => {
    if (!newProperty.name.trim() || !newProperty.islandName.trim()) return;
    setAddSaving(true);
    try {
      const id = slugify(newProperty.name);
      await setDoc(doc(db, 'properties', id), {
        id,
        name: newProperty.name.trim(),
        islandName: newProperty.islandName.trim(),
        atoll: newProperty.atoll.trim(),
        pricePerNight: parseFloat(newProperty.pricePerNight) || 100,
        tags: Array.isArray(newProperty.tags) ? newProperty.tags : [],
        note: newProperty.note.trim(),
        packageType: newProperty.packageType,
        active: true,
        sortOrder: properties.length + 1,
      });
      setNewProperty({ ...BLANK_PROPERTY, packageType: catalogView === 'guesthouse' ? 'local' : 'resort' });
      setAddPropertyOpen(false);
    } catch(e) { alert('Error: ' + e.message); }
    finally { setAddSaving(false); }
  };

  const updateExperience = async (id, field, val) => {
    await updateDoc(doc(db, 'experiences', id), { [field]: val });
  };

  const addExperience = async () => {
    if (!newExp.name.trim() || !addExpOpen) return;
    setAddSaving(true);
    try {
      const id = slugify(newExp.name) + '-' + addExpOpen.slice(0, 8);
      const b = writeBatch(db);
      const propExps = experiences.filter(e => e.propertyId === addExpOpen);
      b.set(doc(db, 'experiences', id), {
        id, propertyId: addExpOpen,
        name: newExp.name.trim(),
        iconName: newExp.iconName,
        duration: newExp.duration.trim(),
        defaultPrice: parseFloat(newExp.defaultPrice) || 50,
        activeMonths: newExp.activeMonths,
        active: true, sortOrder: propExps.length + 1,
      });
      await b.commit();
      setNewExp(BLANK_EXP);
      setAddExpOpen(null);
    } catch(e) { alert('Error: ' + e.message); }
    finally { setAddSaving(false); }
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
          <div className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: C.textLight }}>Wave Voyages · Maldives</div>
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

  const TABS = [
    ['overview',  'Overview',  LayoutDashboard],
    ['bookings',  'Bookings',  BookOpen],
    ['messages',  'Messages',  MessageSquare],
    ['catalog',   'Properties', Grid],
    ['packages',  'Packages',  Package],
    ['settings',  'Settings',  Settings],
  ];

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
              <div className="font-display text-lg leading-none" style={{ color: C.navy }}>Wave Voyages</div>
              <div className="text-[9px] tracking-[0.25em] uppercase" style={{ color: C.coral }}>Admin</div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map(([t, label, Icon]) => (
              <button key={t} onClick={() => { setTab(t); setExpanded(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
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
        <div className="md:hidden flex border-t overflow-x-auto" style={{ borderColor: C.border }}>
          {TABS.map(([t, label, Icon]) => (
            <button key={t} onClick={() => { setTab(t); setExpanded(null); }} className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-semibold"
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
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSeed} disabled={seeding || seedDone}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50"
                  style={{ borderColor: C.border, color: seedDone ? C.teal : C.textMid, background: 'white' }}>
                  <Database className="w-3.5 h-3.5" />
                  {seeding ? 'Loading…' : seedDone ? 'Demo data loaded ✓' : 'Load demo data'}
                </button>
                <button onClick={handleDeleteAll} disabled={seeding}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                  style={{ borderColor: C.border, color: C.textMid, background: 'white' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete all data
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Inbox}       label="Total Requests"    value={stats.total}               sub={`${stats.newB} new · ${stats.contacted} in progress`} color={C.navy}   />
              <StatCard icon={AlertCircle} label="Needs Response"    value={stats.newB}                sub="uncontacted requests"  color={C.coral}  />
              <StatCard icon={CheckCircle} label="Confirmed Trips"   value={stats.confirmed}            sub={`${stats.declined} declined`}          color={C.teal}   />
              <StatCard icon={DollarSign}  label="Confirmed Revenue" value={`$${fmt(stats.revenue)}`}  sub={`avg $${fmt(stats.avgVal)} / trip`}     color={C.copper} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
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

                    {exp && (() => {
                      const islandList = Object.entries(b.nightsPerIsland ?? {});
                      return (
                      <div className="border-t" style={{ borderColor: C.borderFaint }}>

                        {/* ── Top bar: contact + pricing ── */}
                        <div className="grid md:grid-cols-2 gap-px" style={{ background: C.borderFaint }}>
                          {/* Contact */}
                          <div className="px-5 py-4" style={{ background: 'white' }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2.5" style={{ color: C.textLight }}>Contact</div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.teal }}>
                                {b.firstName?.[0]}{b.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-sm" style={{ color: C.navy }}>{b.firstName} {b.lastName}</div>
                                <div className="text-xs" style={{ color: C.textLight }}>{fmtDate(b.createdAt)}</div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: C.teal }}>
                                <Mail className="w-3.5 h-3.5 shrink-0" />{b.email}
                              </a>
                              <a href={`https://wa.me/${b.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs hover:underline" style={{ color: C.teal }}>
                                <Phone className="w-3.5 h-3.5 shrink-0" />{b.phone}
                              </a>
                            </div>
                            {b.notes && (
                              <div className="mt-3 p-2.5 rounded-xl text-xs leading-relaxed italic" style={{ background: C.cream, color: C.textMid }}>
                                "{b.notes}"
                              </div>
                            )}
                          </div>

                          {/* Pricing */}
                          <div className="px-5 py-4" style={{ background: 'white' }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-2.5" style={{ color: C.textLight }}>Pricing</div>
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: C.seafoam, color: C.teal }}>
                                {b.packageType === 'resort' ? 'Resort' : 'Local Island'}
                              </span>
                              <span className="text-xs" style={{ color: C.textLight }}>{b.nights} nights · {b.guests} guest{b.guests !== 1 ? 's' : ''} · {b.monthName}</span>
                            </div>
                            <div className="space-y-1.5 text-xs" style={{ color: C.textMid }}>
                              <div className="flex justify-between"><span>Subtotal</span><span>${fmt(b.subtotal)}</span></div>
                              <div className="flex justify-between"><span>GST (16%)</span><span>+${fmt(b.gst)}</span></div>
                            </div>
                            <div className="mt-3 pt-3 flex justify-between items-end border-t" style={{ borderColor: C.border }}>
                              <span className="text-xs font-semibold" style={{ color: C.textMid }}>Total</span>
                              <span className="font-display text-3xl leading-none" style={{ color: C.navy }}>${fmt(b.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* ── Itinerary ── */}
                        {islandList.length > 0 && (
                          <div className="px-5 py-4" style={{ background: C.sand }}>
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: C.textLight }}>Itinerary</div>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                              {islandList.map(([islandId, nights], idx) => {
                                const isl = islands.find(i => i.id === islandId);
                                const islandActs = Object.entries(b.activityQty ?? {})
                                  .filter(([key]) => key.startsWith(islandId + ':'))
                                  .map(([key, qty]) => {
                                    const act = activities.find(a => a.id === key.split(':')[1]);
                                    return { act, qty };
                                  });
                                return (
                                  <div key={islandId} className="flex gap-3 items-start shrink-0" style={{ maxWidth: 240 }}>
                                    {/* Connector line */}
                                    {idx > 0 && (
                                      <div className="flex items-center pt-5">
                                        <div className="w-6 h-px" style={{ background: C.ltTeal }} />
                                        <ChevronRight className="w-3 h-3 -ml-1" style={{ color: C.ltTeal }} />
                                      </div>
                                    )}
                                    {/* Island card */}
                                    <div className="rounded-2xl overflow-hidden shrink-0" style={{ width: 200, border: `1.5px solid ${C.border}`, background: 'white', boxShadow: '0 2px 8px rgba(12,52,65,0.06)' }}>
                                      {/* Header */}
                                      <div className="px-4 pt-4 pb-3" style={{ background: `linear-gradient(135deg, ${C.navy}, #1a4f62)` }}>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className="font-bold text-sm text-white leading-tight">{isl?.name ?? islandId}</div>
                                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.coral, color: 'white' }}>
                                            {nights}n
                                          </span>
                                        </div>
                                        <div className="text-[10px] opacity-60 text-white">{isl?.atoll ?? ''}</div>
                                      </div>
                                      {/* Activities */}
                                      <div className="px-3 py-3">
                                        {islandActs.length > 0 ? (
                                          <div className="space-y-1.5">
                                            {islandActs.map(({ act, qty }, i) => (
                                              <div key={i} className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.teal }} />
                                                  <span className="text-xs truncate" style={{ color: C.textMid }}>{act?.name ?? '—'}</span>
                                                </div>
                                                {qty > 1 && (
                                                  <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded-full" style={{ background: C.seafoam, color: C.teal }}>×{qty}</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-xs" style={{ color: C.textLight }}>No activities booked</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* ── Actions ── */}
                        <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-t" style={{ borderColor: C.borderFaint, background: 'white' }}>
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
                      );
                    })()}
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

        {/* ═══ CATALOG TAB ═══ */}
        {tab === 'catalog' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Properties</h1>
                <p className="text-sm" style={{ color: C.textLight }}>
                  {catalogView === 'resort'
                    ? `${properties.filter(p => p.packageType === 'resort').length} resorts`
                    : `${properties.filter(p => p.packageType === 'local').length} guesthouses`}
                  {' · '}{experiences.length} experiences
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setNewProperty({ ...BLANK_PROPERTY, packageType: catalogView === 'guesthouse' ? 'local' : 'resort' }); setAddPropertyOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: C.navy }}>
                  <Plus className="w-3.5 h-3.5" /> Add Property
                </button>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {[['resort','Resorts'],['guesthouse','Guesthouses']].map(([v,l]) => (
                    <button key={v} onClick={() => setCatalogView(v)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: catalogView === v ? 'white' : 'transparent', color: catalogView === v ? C.navy : C.textLight, boxShadow: catalogView === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Properties list (filtered by tab) ── */}
            {(() => {
              const typeFilter = catalogView === 'guesthouse' ? 'local' : 'resort';
              const filtered   = properties.filter(p => p.packageType === typeFilter);
              return (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  {filtered.length === 0 && (
                    <div className="text-center py-14 text-sm" style={{ color: C.textLight }}>
                      No {catalogView === 'guesthouse' ? 'guesthouses' : 'resorts'} yet. Click "Add Property" to get started.
                    </div>
                  )}
                  {filtered.map((prop, pi) => {
                    const propExps   = experiences.filter(e => e.propertyId === prop.id);
                    const isExpanded = expandedPropExp.has(prop.id);
                    const toggleExp  = () => setExpandedPropExp(prev => {
                      const s = new Set(prev);
                      isExpanded ? s.delete(prop.id) : s.add(prop.id);
                      return s;
                    });
                    return (
                      <div key={prop.id} style={{ borderTop: pi > 0 ? `1px solid ${C.borderFaint}` : 'none' }}>
                        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
                          <button onClick={toggleExp}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-gray-200"
                            style={{ color: C.textLight }}>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm" style={{ color: C.navy }}>{prop.name}</div>
                            <div className="text-xs mt-0.5" style={{ color: C.textLight }}>
                              {prop.islandName ?? prop.islandId}{prop.atoll ? ` · ${prop.atoll}` : ''}
                              {prop.note ? ` · ${prop.note}` : ''}
                            </div>
                          </div>
                          <div className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: C.cream, color: C.textMid }}>
                            {propExps.length} exp
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textLight }}>$/night</div>
                              <InlineInput value={prop.pricePerNight} onSave={val => updateProperty(prop.id, 'pricePerNight', val)} />
                            </div>
                            <button onClick={() => updateProperty(prop.id, 'active', !prop.active)}
                              className="w-10 h-6 rounded-full transition-all flex items-center shrink-0"
                              style={{ background: prop.active ? C.teal : C.border, padding: '2px' }}>
                              <div className="w-5 h-5 rounded-full bg-white shadow transition-transform"
                                style={{ transform: prop.active ? 'translateX(16px)' : 'translateX(0)' }} />
                            </button>
                            <button onClick={() => setDeleteConfirm({ type: 'properties', id: prop.id, name: prop.name })}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                              style={{ background: '#fce4ec', color: '#c62828' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline experiences */}
                        {isExpanded && (
                          <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: C.borderFaint, background: C.sand }}>
                            {propExps.length === 0 && (
                              <p className="text-xs mb-3" style={{ color: C.textLight }}>No experiences yet. Add the first one below.</p>
                            )}
                            {propExps.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {propExps.map(exp => (
                                  <div key={exp.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group/exp"
                                    style={{ background: 'white', border: `1px solid ${C.border}` }}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                      style={{ background: C.navy }}>
                                      <span className="text-[10px] text-white font-bold">{exp.iconName?.[0] ?? '✦'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold" style={{ color: C.navy }}>{exp.name}</div>
                                      <div className="text-xs" style={{ color: C.textLight }}>
                                        ${exp.defaultPrice} pp · {exp.duration}
                                        {exp.activeMonths?.length < 12 ? ` · ${exp.activeMonths.length} months` : ' · All year'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <InlineInput value={exp.defaultPrice} onSave={val => updateExperience(exp.id, 'defaultPrice', val)} />
                                      <button onClick={() => updateExperience(exp.id, 'active', !exp.active)}
                                        className="w-8 h-5 rounded-full transition-all flex items-center shrink-0"
                                        style={{ background: exp.active ? C.teal : C.border, padding: '2px' }}>
                                        <div className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                                          style={{ transform: exp.active ? 'translateX(12px)' : 'translateX(0)' }} />
                                      </button>
                                      <button onClick={() => setDeleteConfirm({ type: 'experiences', id: exp.id, name: exp.name })}
                                        className="opacity-0 group-hover/exp:opacity-100 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                                        style={{ background: '#fce4ec', color: '#c62828' }}>
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button onClick={() => { setNewExp(BLANK_EXP); setAddExpOpen(prop.id); }}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold transition-all hover:border-solid"
                              style={{ borderColor: C.coral, color: C.coral }}>
                              <Plus className="w-3.5 h-3.5" /> Add Experience
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── Add Property Modal ── */}
            {addPropertyOpen && (() => {
              const PRESET_TAGS = catalogView === 'guesthouse'
                ? ['Beachfront','Pool','Budget','Boutique','Surf','Diving','Snorkeling','Quiet','Convenient','Local Feel','Family-friendly','Romantic','House Reef']
                : ['Overwater','Beachfront','Pool','Spa','Diving','Snorkeling','Whale Sharks','Mantas','Romantic','Adults-only','Family-friendly','Boutique','House Reef','All-inclusive'];
              const toggleTag = tag => setNewProperty(p => ({
                ...p,
                tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
              }));
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" style={{ background: 'white', maxHeight: '92vh', overflowY: 'auto' }}>

                    {/* Header */}
                    <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: C.borderFaint }}>
                      <div>
                        <h3 className="font-display text-xl" style={{ color: C.navy }}>Add Property</h3>
                        <p className="text-xs mt-0.5" style={{ color: C.textLight }}>Fill in all the details for this property</p>
                      </div>
                      <button onClick={() => setAddPropertyOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="px-6 py-5 space-y-5">

                      {/* Type */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.textLight }}>Property Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { v: 'resort', label: 'Resort', sub: 'Private island, own world', emoji: '🏝️' },
                            { v: 'local',  label: 'Guesthouse', sub: 'Local island, shared destination', emoji: '🏡' },
                          ].map(({ v, label, sub, emoji }) => {
                            const sel = newProperty.packageType === v;
                            return (
                              <button key={v} type="button"
                                onClick={() => setNewProperty(p => ({ ...p, packageType: v }))}
                                className="flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all"
                                style={{ borderColor: sel ? C.navy : C.border, background: sel ? C.navy : 'white' }}>
                                <span className="text-xl shrink-0">{emoji}</span>
                                <div>
                                  <div className="font-semibold text-sm" style={{ color: sel ? 'white' : C.navy }}>{label}</div>
                                  <div className="text-[10px] leading-snug mt-0.5" style={{ color: sel ? 'rgba(255,255,255,0.6)' : C.textLight }}>{sub}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Identity */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.textLight }}>Property Details</label>
                        <div className="space-y-2.5">
                          <input className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:border-current"
                            style={{ borderColor: C.border, color: C.navy, fontFamily: 'inherit' }}
                            placeholder="Property name *  (e.g. Four Seasons Landaa Giraavaru)"
                            value={newProperty.name} onChange={e => setNewProperty(p => ({ ...p, name: e.target.value }))} />
                          <div className="grid grid-cols-2 gap-2.5">
                            <input className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                              style={{ borderColor: C.border, color: C.navy, fontFamily: 'inherit' }}
                              placeholder={newProperty.packageType === 'resort' ? 'Island name *' : 'Island name *  (e.g. Maafushi)'}
                              value={newProperty.islandName} onChange={e => setNewProperty(p => ({ ...p, islandName: e.target.value }))} />
                            <input className="px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                              style={{ borderColor: C.border, color: C.navy, fontFamily: 'inherit' }}
                              placeholder="Atoll  (e.g. Baa Atoll)"
                              value={newProperty.atoll} onChange={e => setNewProperty(p => ({ ...p, atoll: e.target.value }))} />
                          </div>
                          <input className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                            style={{ borderColor: C.border, color: C.navy, fontFamily: 'inherit' }}
                            placeholder="One-line note for customers  (e.g. Steps from the Cokes break)"
                            value={newProperty.note} onChange={e => setNewProperty(p => ({ ...p, note: e.target.value }))} />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.textLight }}>Pricing</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: C.textLight }}>$</span>
                          <input className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-sm outline-none"
                            style={{ borderColor: C.border, color: C.navy, fontFamily: 'inherit' }}
                            placeholder="Price per night *" type="number" min="0"
                            value={newProperty.pricePerNight} onChange={e => setNewProperty(p => ({ ...p, pricePerNight: e.target.value }))} />
                        </div>
                        <p className="text-[10px] mt-1 px-1" style={{ color: C.textLight }}>Per room / villa, per night. You can adjust this anytime.</p>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: C.textLight }}>
                          Tags · {newProperty.tags.length} selected
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_TAGS.map(tag => {
                            const on = newProperty.tags.includes(tag);
                            return (
                              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                                style={{ background: on ? C.navy : C.sand, color: on ? 'white' : C.textMid, border: `1.5px solid ${on ? C.navy : C.border}` }}>
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: C.borderFaint }}>
                      <button onClick={() => setAddPropertyOpen(false)}
                        className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                        style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
                      <button onClick={addProperty} disabled={addSaving || !newProperty.name.trim() || !newProperty.islandName.trim()}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                        style={{ background: C.navy }}>
                        {addSaving ? 'Saving…' : 'Add Property'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Add Experience Modal ── */}
            {addExpOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ background: 'white' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display text-lg" style={{ color: C.navy }}>Add Experience</h3>
                      <p className="text-xs" style={{ color: C.textLight }}>{properties.find(p => p.id === addExpOpen)?.name}</p>
                    </div>
                    <button onClick={() => setAddExpOpen(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                    <input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }}
                      placeholder="Experience name *" value={newExp.name} onChange={e => setNewExp(x => ({ ...x, name: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <select className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }}
                        value={newExp.iconName} onChange={e => setNewExp(x => ({ ...x, iconName: e.target.value }))}>
                        {['Fish','Anchor','Sun','Heart','Sparkles','Wind','Flower2','Camera','Utensils','Music','Compass','Waves'].map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                      <input className="px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }}
                        placeholder="Duration (e.g. 2 hrs)" value={newExp.duration} onChange={e => setNewExp(x => ({ ...x, duration: e.target.value }))} />
                    </div>
                    <input className="w-full px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: C.border }}
                      placeholder="Price per person ($)" type="number" value={newExp.defaultPrice}
                      onChange={e => setNewExp(x => ({ ...x, defaultPrice: e.target.value }))} />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold" style={{ color: C.textLight }}>Available months</div>
                        <button type="button"
                          onClick={() => setNewExp(x => ({ ...x, activeMonths: x.activeMonths.length === 12 ? [] : [1,2,3,4,5,6,7,8,9,10,11,12] }))}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all"
                          style={{ background: newExp.activeMonths.length === 12 ? C.navy : C.sand, color: newExp.activeMonths.length === 12 ? 'white' : C.textMid, border: `1px solid ${newExp.activeMonths.length === 12 ? C.navy : C.border}` }}>
                          All year
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => {
                          const n = i + 1;
                          const active = newExp.activeMonths.includes(n);
                          return (
                            <button key={n} type="button"
                              onClick={() => setNewExp(x => ({ ...x, activeMonths: active ? x.activeMonths.filter(v => v !== n) : [...x.activeMonths, n] }))}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                              style={{ background: active ? C.teal : C.sand, color: active ? 'white' : C.textMid, border: `1px solid ${active ? C.teal : C.border}` }}>
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setAddExpOpen(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
                    <button onClick={addExperience} disabled={addSaving || !newExp.name}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: C.coral }}>
                      {addSaving ? 'Saving…' : 'Add Experience'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PACKAGES TAB ═══ */}
        {tab === 'packages' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Curated Packages</h1>
                <p className="text-sm" style={{ color: C.textLight }}>{packages.length} package{packages.length !== 1 ? 's' : ''} · shown on the home page</p>
              </div>
              <button onClick={() => setPkgModal({ mode: 'create', data: { ...BLANK_PKG } })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: C.navy }}>
                <Plus className="w-4 h-4" /> New Package
              </button>
            </div>

            {packages.length === 0 && (
              <div className="rounded-3xl p-16 text-center" style={{ background: 'white', border: `2px dashed ${C.border}` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: C.sand }}>
                  <Package className="w-7 h-7" style={{ color: C.textLight }} />
                </div>
                <div className="font-display text-xl mb-1" style={{ color: C.navy }}>No packages yet</div>
                <p className="text-sm mb-5" style={{ color: C.textLight }}>Create your first curated trip or load demo data from Overview.</p>
                <button onClick={() => setPkgModal({ mode: 'create', data: { ...BLANK_PKG } })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: C.navy }}>
                  <Plus className="w-4 h-4" /> Create Package
                </button>
              </div>
            )}

            <div className="space-y-3">
              {packages.map(pkg => {
                const islandLabels = (pkg.islands || []).map(id => islands.find(i => i.id === id)?.name ?? id);
                return (
                  <div key={pkg.id} className="rounded-2xl overflow-hidden group" style={{ background: 'white', border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(12,52,65,0.04)' }}>
                    <div className="flex items-stretch">

                      {/* Color stripe + thumbnail */}
                      <div className="w-40 shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${pkg.accentColor || C.navy}, ${pkg.badgeColor || C.coral})` }}>
                        <img src={pkg.image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                          onError={e => { e.target.style.display = 'none'; }} />
                        <div className="absolute inset-0 flex flex-col justify-between p-3">
                          <span className="self-start text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                            style={{ background: 'rgba(0,0,0,0.25)' }}>
                            {pkg.badge || 'Package'}
                          </span>
                          <div className="text-white">
                            <div className="font-display text-sm leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{pkg.name}</div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <div className="font-bold text-base leading-tight" style={{ color: C.navy }}>{pkg.name}</div>
                            <div className="text-xs mt-0.5 truncate" style={{ color: C.textLight }}>{pkg.tagline}</div>
                          </div>
                          {/* Active toggle */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-semibold" style={{ color: pkg.active ? C.teal : C.textLight }}>
                              {pkg.active ? 'Live' : 'Hidden'}
                            </span>
                            <button onClick={() => togglePackageActive(pkg.id, pkg.active)}
                              className="w-10 h-6 rounded-full transition-all flex items-center shrink-0"
                              style={{ background: pkg.active ? C.teal : C.border, padding: '2px' }}>
                              <div className="w-5 h-5 rounded-full bg-white shadow transition-transform"
                                style={{ transform: pkg.active ? 'translateX(16px)' : 'translateX(0)' }} />
                            </button>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: pkg.packageType === 'resort' ? C.cream : C.seafoam, color: pkg.packageType === 'resort' ? C.copper : C.teal }}>
                            {pkg.packageType === 'resort' ? 'Resort' : 'Local'}
                          </span>
                          <span className="text-xs" style={{ color: C.textMid }}>{pkg.nights} nights</span>
                          <span style={{ color: C.border }}>·</span>
                          <span className="text-xs" style={{ color: C.textMid }}>{pkg.guests} guests</span>
                          <span style={{ color: C.border }}>·</span>
                          <span className="text-xs" style={{ color: C.textMid }}>{MONTH_FULL[(pkg.month || 1) - 1]}</span>
                        </div>

                        {/* Islands */}
                        {islandLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {islandLabels.map(name => (
                              <span key={name} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: C.navy + '10', color: C.navy }}>
                                <MapPin className="w-2.5 h-2.5" />{name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stats + actions */}
                        <div className="flex items-center gap-4">
                          <div className="flex gap-4">
                            <div className="text-center">
                              <div className="font-bold text-sm" style={{ color: C.navy }}>{pkg.stats?.clicks ?? 0}</div>
                              <div className="text-[10px]" style={{ color: C.textLight }}>Clicks</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-sm" style={{ color: C.navy }}>{pkg.stats?.bookings ?? 0}</div>
                              <div className="text-[10px]" style={{ color: C.textLight }}>Bookings</div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => setPkgModal({ mode: 'edit', data: { ...pkg } })}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105"
                              style={{ borderColor: C.border, color: C.navy, background: 'white' }}>
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={() => setDeletePkgConfirm({ id: pkg.id, name: pkg.name })}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                              style={{ background: '#fce4ec', color: '#c62828' }}>
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {tab === 'settings' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-2xl" style={{ color: C.navy }}>Settings</h1>
                <p className="text-sm" style={{ color: C.textLight }}>Global rates and configuration — saved live to Firestore</p>
              </div>
            </div>

            {!settingsForm ? (
              <div className="text-center py-16 rounded-2xl text-sm" style={{ color: C.textLight, background: 'white', border: `1px solid ${C.border}` }}>
                Load demo data first to initialise settings.
              </div>
            ) : (
              <form onSubmit={saveSettings} className="max-w-xl space-y-5">

                <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="font-semibold text-sm mb-4" style={{ color: C.navy }}>Pricing Rules</div>
                  <div className="space-y-4">
                    {[
                      ['gstRate',            'GST Rate',                 'Decimal (0.16 = 16%)',  'number', '0', '1'],
                      ['transferCostLocal',   'Transfer Cost — Local $',  'Per island hop, per guest', 'number', '0'],
                      ['transferCostResort',  'Transfer Cost — Resort $', 'Per island hop, per guest', 'number', '0'],
                    ].map(([key, label, hint, type, min, max]) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                        <input
                          type={type} step="any" min={min} max={max}
                          value={settingsForm[key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border text-sm"
                          style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <div className="text-[10px] mt-1" style={{ color: C.textLight }}>{hint}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="font-semibold text-sm mb-4" style={{ color: C.navy }}>Trip Limits</div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ['minNights', 'Min Nights', 'number', '1'],
                      ['maxNights', 'Max Nights', 'number', '1'],
                      ['maxGuests', 'Max Guests', 'number', '1'],
                    ].map(([key, label, type, min]) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                        <input
                          type={type} min={min}
                          value={settingsForm[key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border text-sm"
                          style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: 'white', border: `1px solid ${C.border}` }}>
                  <div className="font-semibold text-sm mb-4" style={{ color: C.navy }}>Contact Info</div>
                  <div className="space-y-4">
                    {[
                      ['contactEmail', 'Contact Email', 'email', 'hello@wavevoyages.com'],
                      ['whatsapp',     'WhatsApp Number', 'text',  '+960 300 0000'],
                    ].map(([key, label, type, ph]) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                        <input
                          type={type} placeholder={ph}
                          value={settingsForm[key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border text-sm"
                          style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={settingsSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                  style={{ background: settingsSaved ? C.teal : C.navy }}>
                  <Save className="w-4 h-4" />
                  {settingsSaving ? 'Saving…' : settingsSaved ? 'Saved ✓' : 'Save Settings'}
                </button>
              </form>
            )}

            {/* ── Admin Users ── */}
            <div className="max-w-xl mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-base" style={{ color: C.navy }}>Admin Users</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textLight }}>People who can log in to this panel</div>
                </div>
                <button onClick={() => { setAddAdminErr(''); setAddAdminOpen(true); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: C.navy }}>
                  <UserPlus className="w-3.5 h-3.5" /> Add Admin
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                {/* Current user always shown first */}
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: C.seafoam, borderBottom: `1px solid ${C.border}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.teal }}>
                    {authUser?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: C.navy }}>{authUser?.email}</div>
                    <div className="text-xs" style={{ color: C.teal }}>You · currently signed in</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: C.teal, color: 'white' }}>
                    <Shield className="w-3 h-3 inline mr-1" />Admin
                  </span>
                </div>

                {adminUsers.filter(u => u.email !== authUser?.email).map((u, i, arr) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3.5 group hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.borderFaint}` : 'none', background: 'white' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: C.navy }}>
                      {(u.displayName || u.email)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: C.navy }}>{u.displayName || u.email}</div>
                      <div className="text-xs" style={{ color: C.textLight }}>{u.email}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: u.role === 'admin' ? C.navy + '12' : C.sand, color: u.role === 'admin' ? C.navy : C.textLight }}>
                      {u.role || 'admin'}
                    </span>
                    <button onClick={() => setRemoveAdminConfirm(u)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{ background: '#fce4ec', color: '#c62828' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {adminUsers.filter(u => u.email !== authUser?.email).length === 0 && (
                  <div className="px-4 py-6 text-center" style={{ background: 'white' }}>
                    <div className="text-xs" style={{ color: C.textLight }}>No other admins yet. Add one above.</div>
                  </div>
                )}
              </div>
              <p className="text-[10px] mt-2" style={{ color: C.textLight }}>
                Removing an admin from this list revokes their Firestore access but their Firebase Auth account remains. Delete it from the Firebase Console if needed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ PACKAGE CREATE / EDIT MODAL ═══ */}
      {pkgModal && (() => {
        const d = pkgModal.data;
        const set = fn => setPkgModal(m => ({ ...m, data: fn(m.data) }));
        const isCreate = pkgModal.mode === 'create';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.55)' }}
            onClick={e => { if (e.target === e.currentTarget) setPkgModal(null); }}>
            <div className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'white', maxHeight: '92vh', overflowY: 'auto' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: C.borderFaint }}>
                <div>
                  <div className="font-display text-xl" style={{ color: C.navy }}>{isCreate ? 'New Package' : 'Edit Package'}</div>
                  <div className="text-xs" style={{ color: C.textLight }}>{isCreate ? 'Create a new curated trip' : d.name}</div>
                </div>
                <button onClick={() => setPkgModal(null)} style={{ color: C.textLight }}><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-5">

                {/* Preview strip */}
                <div className="rounded-2xl h-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${d.accentColor || C.navy}, ${d.badgeColor || C.coral})` }}>
                  <img src={d.image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" onError={e => { e.target.style.display='none'; }} />
                  <div className="absolute inset-0 flex flex-col justify-center px-5">
                    <div className="font-display text-lg text-white leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{d.name || 'Package name'}</div>
                    <div className="text-xs text-white opacity-70">{d.tagline || 'Tagline'}</div>
                  </div>
                  {d.badge && (
                    <span className="absolute top-3 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'rgba(0,0,0,0.3)' }}>{d.badge}</span>
                  )}
                </div>

                {/* Name + tagline */}
                {[['name','Package Name *','text'],['tagline','Tagline','text'],['badge','Badge Label','text'],['image','Image Path','text']].map(([key, label, type]) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                    <input type={type} value={d[key] ?? ''} onChange={e => set(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                      style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  {[['badgeColor','Badge Color'],['accentColor','Accent Color']].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={d[key] || '#f4845f'} onChange={e => set(p => ({ ...p, [key]: e.target.value }))}
                            className="w-9 h-9 rounded-lg border cursor-pointer" style={{ borderColor: C.border, padding: '2px' }} />
                          <input type="text" value={d[key] || ''} onChange={e => set(p => ({ ...p, [key]: e.target.value }))}
                            className="flex-1 px-3 py-2 rounded-xl border text-xs"
                            style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Package Type</label>
                  <div className="flex gap-2">
                    {['local','resort'].map(t => (
                      <button key={t} type="button" onClick={() => set(p => ({ ...p, packageType: t }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border capitalize transition-all"
                        style={{ background: d.packageType === t ? C.navy : 'white', color: d.packageType === t ? 'white' : C.textMid, borderColor: d.packageType === t ? C.navy : C.border }}>
                        {t === 'resort' ? 'Resort / Overwater' : 'Local Island'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nights / Guests / Month */}
                <div className="grid grid-cols-3 gap-3">
                  {[['nights','Nights','number','1','30'],['guests','Default Guests','number','1','12'],['month','Default Month','number','1','12']].map(([key, label, type, min, max]) => (
                    <div key={key}>
                      <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                      <input type={type} min={min} max={max} value={d[key] ?? ''}
                        onChange={e => set(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm text-center"
                        style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  ))}
                </div>

                {/* Islands multi-select */}
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>
                    Islands ({(d.islands || []).length} selected)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border" style={{ borderColor: C.border }}>
                    {islands.filter(i => i.packageType === d.packageType).map(isl => {
                      const sel = (d.islands || []).includes(isl.id);
                      return (
                        <button key={isl.id} type="button"
                          onClick={() => set(p => ({ ...p, islands: sel ? p.islands.filter(x => x !== isl.id) : [...(p.islands || []), isl.id] }))}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: sel ? C.navy : C.sand, color: sel ? 'white' : C.textMid }}>
                          {sel && <CheckCircle className="w-3 h-3" />}
                          {isl.name}
                        </button>
                      );
                    })}
                    {islands.filter(i => i.packageType === d.packageType).length === 0 && (
                      <span className="text-xs" style={{ color: C.textLight }}>No {d.packageType} islands in catalog yet.</span>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Highlights (3 bullet points)</label>
                  <div className="space-y-2">
                    {[0,1,2].map(i => (
                      <input key={i} type="text" placeholder={`e.g. ${['7 nights','Private resort','2 atolls'][i]}`}
                        value={(d.highlights || [])[i] ?? ''}
                        onChange={e => set(p => { const h = [...(p.highlights || ['','',''])]; h[i] = e.target.value; return { ...p, highlights: h }; })}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm"
                        style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                    ))}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setPkgModal(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                    style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
                  <button onClick={savePkgModal} disabled={pkgModalSaving || !d.name?.trim()}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: C.navy }}>
                    {pkgModalSaving ? 'Saving…' : isCreate ? 'Create Package' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ DELETE PACKAGE CONFIRM ═══ */}
      {deletePkgConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center" style={{ background: 'white' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fce4ec' }}>
              <Trash2 className="w-5 h-5" style={{ color: '#c62828' }} />
            </div>
            <div className="font-display text-xl mb-2" style={{ color: C.navy }}>Delete "{deletePkgConfirm.name}"?</div>
            <p className="text-sm mb-6" style={{ color: C.textLight }}>This package will be removed from the home page immediately. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePkgConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
              <button onClick={deletePkg}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#c62828' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD ADMIN MODAL ═══ */}
      {addAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.55)' }}
          onClick={e => { if (e.target === e.currentTarget) setAddAdminOpen(false); }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'white' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: C.borderFaint }}>
              <div>
                <div className="font-display text-xl" style={{ color: C.navy }}>Add Admin</div>
                <div className="text-xs mt-0.5" style={{ color: C.textLight }}>Creates a Firebase Auth account</div>
              </div>
              <button onClick={() => setAddAdminOpen(false)} style={{ color: C.textLight }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['email',       'Email *',        'email',    'admin@example.com'],
                ['displayName', 'Display Name',   'text',     'e.g. Sara'],
                ['password',    'Password *',     'password', 'Min. 6 characters'],
              ].map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                  <input type={type} placeholder={ph} value={newAdmin[key]}
                    onChange={e => setNewAdmin(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Role</label>
                <div className="flex gap-2">
                  {[['admin','Admin — full access'],['viewer','Viewer — read only']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setNewAdmin(p => ({ ...p, role: val }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                      style={{ background: newAdmin.role === val ? C.navy : 'white', color: newAdmin.role === val ? 'white' : C.textMid, borderColor: newAdmin.role === val ? C.navy : C.border }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {addAdminErr && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ background: '#fce4ec', color: '#c62828' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />{addAdminErr}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setAddAdminOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                  style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
                <button onClick={addAdminUser} disabled={addAdminSaving}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: C.navy }}>
                  {addAdminSaving ? 'Creating…' : 'Create Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REMOVE ADMIN CONFIRM ═══ */}
      {removeAdminConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center" style={{ background: 'white' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fce4ec' }}>
              <ShieldOff className="w-5 h-5" style={{ color: '#c62828' }} />
            </div>
            <div className="font-display text-xl mb-1" style={{ color: C.navy }}>Remove {removeAdminConfirm.displayName || removeAdminConfirm.email}?</div>
            <p className="text-sm mb-1" style={{ color: C.textLight }}>{removeAdminConfirm.email}</p>
            <p className="text-xs mb-6" style={{ color: C.textLight }}>
              They'll lose access to this panel. Their Firebase Auth account stays active — delete it from the Firebase Console to fully revoke access.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveAdminConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
              <button onClick={removeAdminUser}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#c62828' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD ISLAND MODAL ═══ */}
      {addIslandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setAddIslandOpen(false); }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.borderFaint }}>
              <div className="font-display text-lg" style={{ color: C.navy }}>Add Island</div>
              <button onClick={() => setAddIslandOpen(false)} style={{ color: C.textLight }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['name',  'Island Name *',  'text', 'e.g. Dhiffushi'],
                ['atoll', 'Atoll',          'text', 'e.g. Kaafu Atoll'],
                ['note',  'Short note',     'text', 'e.g. Quiet beach, great house reef'],
                ['tags',  'Tags (comma separated)', 'text', 'e.g. Beaches, Snorkeling'],
                ['image', 'Image path',     'text', '/images/local-island.png'],
              ].map(([key, label, type, ph]) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                  <input type={type} placeholder={ph} value={newIsland[key] ?? ''}
                    onChange={e => setNewIsland(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Type</label>
                  <div className="flex gap-2">
                    {['local','resort'].map(t => (
                      <button key={t} type="button" onClick={() => setNewIsland(p => ({ ...p, packageType: t }))}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all"
                        style={{ background: newIsland.packageType === t ? C.navy : 'white', color: newIsland.packageType === t ? 'white' : C.textMid, borderColor: newIsland.packageType === t ? C.navy : C.border }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>Base Price / Night ($)</label>
                  <input type="number" min="0" value={newIsland.basePerNight}
                    onChange={e => setNewIsland(p => ({ ...p, basePerNight: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddIslandOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                  style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
                <button onClick={addIsland} disabled={addSaving || !newIsland.name.trim()}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: C.navy }}>
                  {addSaving ? 'Adding…' : 'Add Island'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ═══ DELETE CONFIRM ═══ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(12,52,65,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center" style={{ background: 'white' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fce4ec' }}>
              <Trash2 className="w-5 h-5" style={{ color: '#c62828' }} />
            </div>
            <div className="font-display text-xl mb-2" style={{ color: C.navy }}>Remove {deleteConfirm.name}?</div>
            <p className="text-sm mb-6" style={{ color: C.textLight }}>
              This will permanently delete this {deleteConfirm.type === 'islands' ? 'island' : deleteConfirm.type === 'experiences' ? 'experience' : 'property'} from the catalog. Existing bookings won't be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold border"
                style={{ borderColor: C.border, color: C.textMid }}>Cancel</button>
              <button onClick={deleteItem}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ background: '#c62828' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
