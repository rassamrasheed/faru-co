import { db } from './firebase';
import { writeBatch, doc } from 'firebase/firestore';

const ALL = [1,2,3,4,5,6,7,8,9,10,11,12];

/* ─── ISLANDS ─── */
export const ISLANDS_SEED = [
  // ── Local islands ──
  { id:'maafushi',   name:'Maafushi',    atoll:'Kaafu Atoll',       zone:'north-male', note:'The classic first-timer favorite',    tags:['Beaches','Snorkeling'], packageType:'local',  active:true, sortOrder:1, basePerNight:80,  image:'/images/local-island.png' },
  { id:'hulhumale',  name:'Hulhumalé',   atoll:'Kaafu Atoll',       zone:'north-male', note:'5 min from the airport',              tags:['Convenient'],           packageType:'local',  active:true, sortOrder:2, basePerNight:65,  image:'/images/family.png'       },
  { id:'thulusdhoo', name:'Thulusdhoo',  atoll:'Kaafu Atoll',       zone:'north-male', note:'Home of the legendary Cokes break',   tags:['Surf'],                 packageType:'local',  active:true, sortOrder:3, basePerNight:85,  image:'/images/surf.png'         },
  { id:'fulidhoo',   name:'Fulidhoo',    atoll:'Vaavu Atoll',       zone:'vaavu',      note:'Nurse sharks sleep at the jetty',     tags:['Quiet','Sharks'],       packageType:'local',  active:true, sortOrder:4, basePerNight:75,  image:'/images/local-island.png' },
  { id:'dhigurah',   name:'Dhigurah',    atoll:'Ari Atoll',         zone:'ari',        note:'Whale sharks every single day',       tags:['Whale Sharks'],         packageType:'local',  active:true, sortOrder:5, basePerNight:90,  image:'/images/adventure.png'   },
  { id:'rasdhoo',    name:'Rasdhoo',     atoll:'Ari Atoll',         zone:'ari',        note:'Hammerheads at dawn — seriously',     tags:['Diving'],               packageType:'local',  active:true, sortOrder:6, basePerNight:95,  image:'/images/adventure.png'   },
  // ── Resort atolls ──
  { id:'baa',        name:'Baa Atoll',   atoll:'UNESCO Biosphere',  zone:'baa',        note:'Hanifaru Bay manta vortex',           tags:['Mantas','UNESCO'],      packageType:'resort', active:true, sortOrder:1, basePerNight:550, image:'/images/honeymoon.png'   },
  { id:'south-ari',  name:'South Ari',   atoll:'Ari Atoll',         zone:'ari',        note:'Whale shark sanctuary all year',      tags:['Whale Sharks'],         packageType:'resort', active:true, sortOrder:2, basePerNight:520, image:'/images/private-resort.png' },
  { id:'north-male', name:'North Malé',  atoll:'Kaafu Atoll',       zone:'north-male', note:'20-min speedboat from airport',       tags:['Accessible'],           packageType:'resort', active:true, sortOrder:3, basePerNight:480, image:'/images/private-resort.png' },
  { id:'lhaviyani',  name:'Lhaviyani',   atoll:'Northern Atolls',   zone:'lhaviyani',  note:'Overwater villas, zero crowds',       tags:['Secluded'],             packageType:'resort', active:true, sortOrder:4, basePerNight:540, image:'/images/honeymoon.png'   },
  { id:'raa',        name:'Raa Atoll',   atoll:'Raa Atoll',         zone:'raa',        note:'House reefs untouched by time',       tags:['Remote'],               packageType:'resort', active:true, sortOrder:5, basePerNight:580, image:'/images/local-island.png'},
  { id:'noonu',      name:'Noonu Atoll', atoll:'Noonu Atoll',       zone:'noonu',      note:'Seaplane-only. Gloriously remote',    tags:['Luxury'],               packageType:'resort', active:true, sortOrder:6, basePerNight:620, image:'/images/private-resort.png' },
];

/* ─── ACTIVITIES with per-island prices ─── */
export const ACTIVITIES_SEED = [
  {
    id:'snorkel', name:'Snorkeling Trip', iconName:'Fish', duration:'3 hours',
    defaultPrice:35, availableAt:'*', activeMonths:ALL, active:true, sortOrder:1,
    prices:{ maafushi:30, hulhumale:28, thulusdhoo:32, fulidhoo:35, dhigurah:38, rasdhoo:40, baa:65, 'south-ari':60, 'north-male':55, lhaviyani:62, raa:68, noonu:70 },
  },
  {
    id:'dive', name:'Scuba Diving', iconName:'Anchor', duration:'4 hours',
    defaultPrice:110, availableAt:'*', activeMonths:ALL, active:true, sortOrder:2,
    prices:{ maafushi:90, hulhumale:85, thulusdhoo:95, fulidhoo:100, dhigurah:105, rasdhoo:110, baa:160, 'south-ari':150, 'north-male':140, lhaviyani:155, raa:165, noonu:175 },
  },
  {
    id:'whaleshark', name:'Whale Shark Safari', iconName:'Waves', duration:'Full day',
    defaultPrice:120, availableAt:['dhigurah','south-ari'], activeMonths:ALL, active:true, sortOrder:3,
    prices:{ dhigurah:115, 'south-ari':170 },
  },
  {
    id:'manta', name:'Manta Ray Snorkel', iconName:'Sparkles', duration:'Half day',
    defaultPrice:85, availableAt:['baa','south-ari','rasdhoo'], activeMonths:[5,6,7,8,9,10,11], active:true, sortOrder:4,
    prices:{ baa:120, 'south-ari':110, rasdhoo:88 },
  },
  {
    id:'sunset', name:'Sunset Fishing', iconName:'Sun', duration:'3 hours',
    defaultPrice:45, availableAt:'*', activeMonths:ALL, active:true, sortOrder:5,
    prices:{ maafushi:40, hulhumale:38, thulusdhoo:42, fulidhoo:45, dhigurah:45, rasdhoo:48, baa:75, 'south-ari':70, 'north-male':65, lhaviyani:72, raa:78, noonu:80 },
  },
  {
    id:'dolphin', name:'Dolphin Cruise', iconName:'Heart', duration:'2 hours',
    defaultPrice:40, availableAt:'*', activeMonths:ALL, active:true, sortOrder:6,
    prices:{ maafushi:38, hulhumale:35, thulusdhoo:40, fulidhoo:42, dhigurah:42, rasdhoo:45, baa:68, 'south-ari':65, 'north-male':60, lhaviyani:65, raa:70, noonu:72 },
  },
  {
    id:'sandbank', name:'Sandbank Picnic', iconName:'Wind', duration:'Half day',
    defaultPrice:75, availableAt:'*', activeMonths:ALL, active:true, sortOrder:7,
    prices:{ maafushi:65, hulhumale:60, thulusdhoo:68, fulidhoo:72, dhigurah:75, rasdhoo:78, baa:140, 'south-ari':130, 'north-male':120, lhaviyani:135, raa:145, noonu:150 },
  },
  {
    id:'spa', name:'Traditional Spa', iconName:'Flower2', duration:'90 min',
    defaultPrice:95, availableAt:['maafushi','thulusdhoo','fulidhoo','dhigurah','rasdhoo','baa','south-ari','north-male','lhaviyani','raa','noonu'], activeMonths:ALL, active:true, sortOrder:8,
    prices:{ maafushi:80, thulusdhoo:85, fulidhoo:88, dhigurah:90, rasdhoo:92, baa:180, 'south-ari':175, 'north-male':165, lhaviyani:178, raa:185, noonu:195 },
  },
  {
    id:'surf', name:'Surf Lesson', iconName:'Compass', duration:'2 hours',
    defaultPrice:60, availableAt:['thulusdhoo','north-male'], activeMonths:[3,4,5,6,7,8,9,10], active:true, sortOrder:9,
    prices:{ thulusdhoo:60, 'north-male':90 },
  },
  {
    id:'photo', name:'Photography Tour', iconName:'Camera', duration:'Full day',
    defaultPrice:150, availableAt:'*', activeMonths:ALL, active:true, sortOrder:10,
    prices:{ maafushi:130, hulhumale:120, thulusdhoo:140, fulidhoo:145, dhigurah:150, rasdhoo:155, baa:250, 'south-ari':240, 'north-male':220, lhaviyani:245, raa:260, noonu:280 },
  },
  {
    id:'dinner', name:'Private Beach Dinner', iconName:'Utensils', duration:'Evening',
    defaultPrice:85, availableAt:['maafushi','thulusdhoo','fulidhoo','dhigurah','rasdhoo','baa','south-ari','north-male','lhaviyani','raa','noonu'], activeMonths:ALL, active:true, sortOrder:11,
    prices:{ maafushi:75, thulusdhoo:78, fulidhoo:82, dhigurah:85, rasdhoo:88, baa:160, 'south-ari':155, 'north-male':145, lhaviyani:158, raa:165, noonu:172 },
  },
  {
    id:'boduberu', name:'Bodu Beru Show', iconName:'Music', duration:'Evening',
    defaultPrice:30, availableAt:['maafushi','fulidhoo','thulusdhoo'], activeMonths:ALL, active:true, sortOrder:12,
    prices:{ maafushi:28, fulidhoo:32, thulusdhoo:30 },
  },
];

/* ─── CURATED PACKAGES ─── */
export const CURATED_SEED = [
  { id:'honeymoon', name:'Honeymoon Escape',    tagline:'For the chapter that changes everything.', badge:'Most popular',    badgeColor:'#f4845f', accentColor:'#c97b4e', packageType:'resort', nights:7,  guests:2, month:2, islands:['baa','south-ari'],             highlights:['7 nights','Private resort','2 atolls'], image:'/images/honeymoon.png',        active:true, sortOrder:1, stats:{clicks:0,bookings:0} },
  { id:'adventure', name:'Wild Blue Adventure', tagline:"Whale sharks won't find themselves.",      badge:'Best for divers', badgeColor:'#2a9d8f', accentColor:'#2a9d8f', packageType:'local',  nights:10, guests:2, month:6, islands:['dhigurah','rasdhoo','maafushi'], highlights:['10 nights','Local islands','3 atolls'], image:'/images/adventure.png',        active:true, sortOrder:2, stats:{clicks:0,bookings:0} },
  { id:'family',    name:'Family Paradise',     tagline:"The trip they'll talk about forever.",     badge:'Family friendly', badgeColor:'#6c9e4f', accentColor:'#b8962e', packageType:'local',  nights:8,  guests:4, month:1, islands:['maafushi','hulhumale'],          highlights:['8 nights','Local islands','4 guests'],  image:'/images/family.png',           active:true, sortOrder:3, stats:{clicks:0,bookings:0} },
  { id:'surf',      name:'Surf & Soul',         tagline:'Just you, the board, and perfect left-handers.', badge:'Solo escape', badgeColor:'#7a5af8', accentColor:'#7a5af8', packageType:'local', nights:5, guests:1, month:5, islands:['thulusdhoo'],                highlights:['5 nights','Local island','Solo'],        image:'/images/surf.png',             active:true, sortOrder:4, stats:{clicks:0,bookings:0} },
];

/* ─── SETTINGS ─── */
export const SETTINGS_SEED = {
  gstRate: 0.16,
  transferCostLocal: 45,
  transferCostResort: 180,
  maxNights: 21,
  minNights: 2,
  maxGuests: 12,
  contactEmail: 'hello@faru.co',
  whatsapp: '+960 300 0000',
};

/* ─── SEED FUNCTION ─── */
export async function seedAllCollections() {
  const batch = writeBatch(db);
  for (const island   of ISLANDS_SEED)    batch.set(doc(db, 'islands',          island.id),   island);
  for (const activity of ACTIVITIES_SEED) batch.set(doc(db, 'activities',       activity.id), activity);
  for (const pkg      of CURATED_SEED)    batch.set(doc(db, 'curatedPackages',  pkg.id),      pkg);
  batch.set(doc(db, 'settings', 'app'), SETTINGS_SEED);
  await batch.commit();
}
