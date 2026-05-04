import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import AdminPanel from './AdminPanel';
import {
  Waves, Fish, Anchor, Sun, Heart, Sparkles, MapPin,
  Plus, Minus, Check, Wind, Flower2, Camera, Utensils, Music,
  Compass, ArrowRight, ArrowLeft, X, AlertCircle, Shuffle, Plane,
  RotateCcw, Zap, Share2, ChevronDown,
} from 'lucide-react';

const ICON_MAP = { Fish, Anchor, Sun, Heart, Sparkles, Wind, Flower2, Camera, Utensils, Music, Compass, Waves };

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

const PROPERTIES = [
  // ── Guesthouses ──
  { id: 'p-maafushi-1',   islandId: 'maafushi',   islandName: 'Maafushi',   atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'Kaani Village Hotel',           pricePerNight: 95,   tags: ['Pool', 'Beachfront'],           note: 'Largest pool on the island' },
  { id: 'p-maafushi-2',   islandId: 'maafushi',   islandName: 'Maafushi',   atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'Maafushi Inn',                  pricePerNight: 75,   tags: ['Budget', 'Convenient'],         note: 'Best value on Maafushi' },
  { id: 'p-hulhumale-1',  islandId: 'hulhumale',  islandName: 'Hulhumalé',  atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'The Westin Maldives',           pricePerNight: 120,  tags: ['Modern', 'Convenient'],         note: '5 min from the airport' },
  { id: 'p-hulhumale-2',  islandId: 'hulhumale',  islandName: 'Hulhumalé',  atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'Crossroads Maldives',           pricePerNight: 145,  tags: ['Boutique', 'Pool'],             note: 'Lifestyle destination island' },
  { id: 'p-thulusdhoo-1', islandId: 'thulusdhoo', islandName: 'Thulusdhoo', atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'Cokes Surf Inn',                pricePerNight: 85,   tags: ['Surf', 'Beachfront'],           note: 'Steps from the Cokes break' },
  { id: 'p-thulusdhoo-2', islandId: 'thulusdhoo', islandName: 'Thulusdhoo', atoll: 'Kaafu Atoll',  packageType: 'local',  name: 'Thulusdhoo Beach House',        pricePerNight: 70,   tags: ['Quiet', 'Local Feel'],          note: 'Run by a local surf family' },
  { id: 'p-fulidhoo-1',   islandId: 'fulidhoo',   islandName: 'Fulidhoo',   atoll: 'Vaavu Atoll',  packageType: 'local',  name: 'Fulidhoo View',                 pricePerNight: 68,   tags: ['Quiet', 'Authentic'],           note: 'Nurse sharks at the jetty' },
  { id: 'p-dhigurah-1',   islandId: 'dhigurah',   islandName: 'Dhigurah',   atoll: 'Ari Atoll',    packageType: 'local',  name: 'Whale Shark Inn',               pricePerNight: 88,   tags: ['Whale Sharks', 'Diving'],       note: 'Daily whale shark excursions' },
  { id: 'p-dhigurah-2',   islandId: 'dhigurah',   islandName: 'Dhigurah',   atoll: 'Ari Atoll',    packageType: 'local',  name: 'Dhigurah Beach Inn',            pricePerNight: 72,   tags: ['Beachfront', 'Snorkeling'],     note: 'Right on the sandbank strip' },
  { id: 'p-rasdhoo-1',    islandId: 'rasdhoo',    islandName: 'Rasdhoo',    atoll: 'Ari Atoll',    packageType: 'local',  name: 'Rasdhoo Divers Inn',            pricePerNight: 82,   tags: ['Diving', 'House Reef'],         note: 'Hammerheads at dawn — seriously' },
  // ── Resorts ──
  { id: 'p-baa-1',        islandId: 'baa',        islandName: 'Landaa Giraavaru',  atoll: 'Baa Atoll',      packageType: 'resort', name: 'Four Seasons Landaa Giraavaru', pricePerNight: 1850, tags: ['Ultra-Luxury', 'Mantas', 'Overwater'],    note: 'Inside Hanifaru Bay manta zone' },
  { id: 'p-baa-2',        islandId: 'baa',        islandName: 'Kihavah Huravalhi', atoll: 'Baa Atoll',      packageType: 'resort', name: 'Anantara Kihavah',              pricePerNight: 1100, tags: ['Overwater', 'Mantas', 'Spa'],             note: 'Underwater restaurant & spa' },
  { id: 'p-south-ari-1',  islandId: 'south-ari',  islandName: 'Fesdu Island',      atoll: 'Ari Atoll',      packageType: 'resort', name: 'W Maldives',                    pricePerNight: 980,  tags: ['Whale Sharks', 'Vibrant', 'Overwater'],  note: 'Year-round whale sharks' },
  { id: 'p-south-ari-2',  islandId: 'south-ari',  islandName: 'Maalifushi Island', atoll: 'Ari Atoll',      packageType: 'resort', name: 'COMO Maalifushi',                pricePerNight: 1150, tags: ['Wellness', 'Diving', 'House Reef'],      note: 'Award-winning spa & house reef' },
  { id: 'p-north-male-1', islandId: 'north-male', islandName: 'Emboodhoo Lagoon',  atoll: 'Kaafu Atoll',    packageType: 'resort', name: 'Taj Exotica',                    pricePerNight: 680,  tags: ['Beachfront', 'Romantic', 'House Reef'],  note: '20-min speedboat from airport' },
  { id: 'p-north-male-2', islandId: 'north-male', islandName: 'Baros Island',      atoll: 'Kaafu Atoll',    packageType: 'resort', name: 'Baros Maldives',                 pricePerNight: 850,  tags: ['Boutique', 'Romantic', 'Adults-only'],   note: 'Boutique charm, pristine lagoon' },
  { id: 'p-lhaviyani-1',  islandId: 'lhaviyani',  islandName: 'Kuredu Island',     atoll: 'Lhaviyani Atoll',packageType: 'resort', name: 'Kuredu Island Resort',           pricePerNight: 490,  tags: ['Diving', 'Family-friendly', 'Pool'],     note: 'Overwater villas, zero crowds' },
  { id: 'p-raa-1',        islandId: 'raa',        islandName: 'Kuredhivaru Island',atoll: 'Raa Atoll',      packageType: 'resort', name: 'Mövenpick Kuredhivaru',          pricePerNight: 620,  tags: ['Remote', 'House Reef', 'Diving'],        note: 'Untouched reefs, remote paradise' },
  { id: 'p-noonu-1',      islandId: 'noonu',      islandName: 'Velaa Island',      atoll: 'Noonu Atoll',    packageType: 'resort', name: 'Velaa Private Island',           pricePerNight: 2200, tags: ['Ultra-Luxury', 'Adults-only', 'Spa'],    note: 'Seaplane-only. Gloriously remote' },
  { id: 'p-noonu-2',      islandId: 'noonu',      islandName: 'Randheli Island',   atoll: 'Noonu Atoll',    packageType: 'resort', name: 'Cheval Blanc Randheli',          pricePerNight: 2500, tags: ['Ultra-Luxury', 'Overwater', 'Private'],  note: 'LVMH flagship in the Maldives' },
];

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/* Demo experiences — property-scoped, matching the Firestore 'experiences' collection shape */
const DEMO_EXPERIENCES = [
  // ── Kaani Village Hotel (Maafushi) ──
  { id: 'p-maafushi-1-snorkel',  propertyId: 'p-maafushi-1', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 35,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-1-sunset',   propertyId: 'p-maafushi-1', name: 'Sunset Fishing',       iconName: 'Sun',      defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-1-dolphin',  propertyId: 'p-maafushi-1', name: 'Dolphin Cruise',       iconName: 'Heart',    defaultPrice: 40,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-1-sandbank', propertyId: 'p-maafushi-1', name: 'Sandbank Picnic',      iconName: 'Wind',     defaultPrice: 75,  duration: 'Half day', activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-1-boduberu', propertyId: 'p-maafushi-1', name: 'Bodu Beru Show',       iconName: 'Music',    defaultPrice: 30,  duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── Maafushi Inn ──
  { id: 'p-maafushi-2-snorkel',  propertyId: 'p-maafushi-2', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 30,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-2-sunset',   propertyId: 'p-maafushi-2', name: 'Sunset Fishing',       iconName: 'Sun',      defaultPrice: 40,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-2-dolphin',  propertyId: 'p-maafushi-2', name: 'Dolphin Cruise',       iconName: 'Heart',    defaultPrice: 35,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-maafushi-2-boduberu', propertyId: 'p-maafushi-2', name: 'Bodu Beru Show',       iconName: 'Music',    defaultPrice: 25,  duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── The Westin Maldives (Hulhumalé) ──
  { id: 'p-hulhumale-1-snorkel', propertyId: 'p-hulhumale-1', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 40,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-hulhumale-1-dolphin', propertyId: 'p-hulhumale-1', name: 'Dolphin Cruise',      iconName: 'Heart',    defaultPrice: 45,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-hulhumale-1-photo',   propertyId: 'p-hulhumale-1', name: 'Photography Tour',    iconName: 'Camera',   defaultPrice: 120, duration: 'Full day', activeMonths: ALL_MONTHS },
  { id: 'p-hulhumale-1-sunset',  propertyId: 'p-hulhumale-1', name: 'Sunset Fishing',      iconName: 'Sun',      defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  // ── Crossroads Maldives ──
  { id: 'p-hulhumale-2-snorkel', propertyId: 'p-hulhumale-2', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-hulhumale-2-dolphin', propertyId: 'p-hulhumale-2', name: 'Dolphin Cruise',      iconName: 'Heart',    defaultPrice: 50,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-hulhumale-2-dinner',  propertyId: 'p-hulhumale-2', name: 'Private Beach Dinner',iconName: 'Utensils', defaultPrice: 95,  duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── Cokes Surf Inn (Thulusdhoo) ──
  { id: 'p-thulusdhoo-1-surf',    propertyId: 'p-thulusdhoo-1', name: 'Surf Lesson',        iconName: 'Compass',  defaultPrice: 60,  duration: '2 hours',  activeMonths: [3,4,5,6,7,8,9,10] },
  { id: 'p-thulusdhoo-1-snorkel', propertyId: 'p-thulusdhoo-1', name: 'Snorkeling Trip',    iconName: 'Fish',     defaultPrice: 35,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-thulusdhoo-1-sunset',  propertyId: 'p-thulusdhoo-1', name: 'Sunset Fishing',     iconName: 'Sun',      defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-thulusdhoo-1-boduberu',propertyId: 'p-thulusdhoo-1', name: 'Bodu Beru Show',     iconName: 'Music',    defaultPrice: 30,  duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── Thulusdhoo Beach House ──
  { id: 'p-thulusdhoo-2-surf',    propertyId: 'p-thulusdhoo-2', name: 'Surf Lesson',        iconName: 'Compass',  defaultPrice: 55,  duration: '2 hours',  activeMonths: [3,4,5,6,7,8,9,10] },
  { id: 'p-thulusdhoo-2-snorkel', propertyId: 'p-thulusdhoo-2', name: 'Snorkeling Trip',    iconName: 'Fish',     defaultPrice: 30,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-thulusdhoo-2-sunset',  propertyId: 'p-thulusdhoo-2', name: 'Sunset Fishing',     iconName: 'Sun',      defaultPrice: 40,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  // ── Fulidhoo View ──
  { id: 'p-fulidhoo-1-snorkel',  propertyId: 'p-fulidhoo-1', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 30,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-fulidhoo-1-sunset',   propertyId: 'p-fulidhoo-1', name: 'Sunset Fishing',       iconName: 'Sun',      defaultPrice: 40,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-fulidhoo-1-dolphin',  propertyId: 'p-fulidhoo-1', name: 'Dolphin Cruise',       iconName: 'Heart',    defaultPrice: 35,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-fulidhoo-1-sandbank', propertyId: 'p-fulidhoo-1', name: 'Sandbank Picnic',      iconName: 'Wind',     defaultPrice: 65,  duration: 'Half day', activeMonths: ALL_MONTHS },
  { id: 'p-fulidhoo-1-boduberu', propertyId: 'p-fulidhoo-1', name: 'Bodu Beru Show',       iconName: 'Music',    defaultPrice: 25,  duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── Whale Shark Inn (Dhigurah) ──
  { id: 'p-dhigurah-1-whaleshark',propertyId: 'p-dhigurah-1', name: 'Whale Shark Safari',  iconName: 'Waves',    defaultPrice: 120, duration: 'Full day', activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-1-snorkel',   propertyId: 'p-dhigurah-1', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 35,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-1-dive',      propertyId: 'p-dhigurah-1', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 110, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-1-sunset',    propertyId: 'p-dhigurah-1', name: 'Sunset Fishing',      iconName: 'Sun',      defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-1-sandbank',  propertyId: 'p-dhigurah-1', name: 'Sandbank Picnic',     iconName: 'Wind',     defaultPrice: 75,  duration: 'Half day', activeMonths: ALL_MONTHS },
  // ── Dhigurah Beach Inn ──
  { id: 'p-dhigurah-2-whaleshark',propertyId: 'p-dhigurah-2', name: 'Whale Shark Safari',  iconName: 'Waves',    defaultPrice: 115, duration: 'Full day', activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-2-snorkel',   propertyId: 'p-dhigurah-2', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 30,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-2-dive',      propertyId: 'p-dhigurah-2', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 100, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-dhigurah-2-sunset',    propertyId: 'p-dhigurah-2', name: 'Sunset Fishing',      iconName: 'Sun',      defaultPrice: 40,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  // ── Rasdhoo Divers Inn ──
  { id: 'p-rasdhoo-1-dive',       propertyId: 'p-rasdhoo-1', name: 'Scuba Diving',         iconName: 'Anchor',   defaultPrice: 110, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-rasdhoo-1-manta',      propertyId: 'p-rasdhoo-1', name: 'Manta Ray Snorkel',    iconName: 'Sparkles', defaultPrice: 85,  duration: 'Half day', activeMonths: [5,6,7,8,9,10,11] },
  { id: 'p-rasdhoo-1-snorkel',    propertyId: 'p-rasdhoo-1', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 35,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-rasdhoo-1-sunset',     propertyId: 'p-rasdhoo-1', name: 'Sunset Fishing',       iconName: 'Sun',      defaultPrice: 45,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  // ── Four Seasons Landaa Giraavaru ──
  { id: 'p-baa-1-manta',    propertyId: 'p-baa-1', name: 'Manta Ray Snorkel',    iconName: 'Sparkles', defaultPrice: 120, duration: 'Half day', activeMonths: [5,6,7,8,9,10,11] },
  { id: 'p-baa-1-dive',     propertyId: 'p-baa-1', name: 'Scuba Diving',         iconName: 'Anchor',   defaultPrice: 150, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-1-snorkel',  propertyId: 'p-baa-1', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 80,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-1-dinner',   propertyId: 'p-baa-1', name: 'Private Beach Dinner', iconName: 'Utensils', defaultPrice: 250, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-1-spa',      propertyId: 'p-baa-1', name: 'Overwater Spa',        iconName: 'Flower2',  defaultPrice: 200, duration: '90 min',   activeMonths: ALL_MONTHS },
  { id: 'p-baa-1-sandbank', propertyId: 'p-baa-1', name: 'Private Sandbank',     iconName: 'Wind',     defaultPrice: 180, duration: 'Half day', activeMonths: ALL_MONTHS },
  // ── Anantara Kihavah ──
  { id: 'p-baa-2-manta',    propertyId: 'p-baa-2', name: 'Manta Ray Snorkel',    iconName: 'Sparkles', defaultPrice: 110, duration: 'Half day', activeMonths: [5,6,7,8,9,10,11] },
  { id: 'p-baa-2-dive',     propertyId: 'p-baa-2', name: 'Scuba Diving',         iconName: 'Anchor',   defaultPrice: 140, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-2-snorkel',  propertyId: 'p-baa-2', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 70,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-2-dinner',   propertyId: 'p-baa-2', name: 'Underwater Dining',    iconName: 'Utensils', defaultPrice: 350, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-baa-2-spa',      propertyId: 'p-baa-2', name: 'Over-Water Spa',       iconName: 'Flower2',  defaultPrice: 180, duration: '90 min',   activeMonths: ALL_MONTHS },
  // ── W Maldives ──
  { id: 'p-south-ari-1-whaleshark',propertyId: 'p-south-ari-1', name: 'Whale Shark Safari',  iconName: 'Waves',    defaultPrice: 150, duration: 'Full day', activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-1-dive',      propertyId: 'p-south-ari-1', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 130, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-1-snorkel',   propertyId: 'p-south-ari-1', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 75,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-1-dinner',    propertyId: 'p-south-ari-1', name: 'Private Beach Dinner',iconName: 'Utensils', defaultPrice: 220, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-1-photo',     propertyId: 'p-south-ari-1', name: 'Photography Tour',    iconName: 'Camera',   defaultPrice: 180, duration: 'Full day', activeMonths: ALL_MONTHS },
  // ── COMO Maalifushi ──
  { id: 'p-south-ari-2-whaleshark',propertyId: 'p-south-ari-2', name: 'Whale Shark Safari',  iconName: 'Waves',    defaultPrice: 140, duration: 'Full day', activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-2-dive',      propertyId: 'p-south-ari-2', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 140, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-2-spa',       propertyId: 'p-south-ari-2', name: 'COMO Shambhala Spa',  iconName: 'Flower2',  defaultPrice: 220, duration: '90 min',   activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-2-dinner',    propertyId: 'p-south-ari-2', name: 'Private Beach Dinner',iconName: 'Utensils', defaultPrice: 200, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-south-ari-2-snorkel',   propertyId: 'p-south-ari-2', name: 'House Reef Snorkel',  iconName: 'Fish',     defaultPrice: 60,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  // ── Taj Exotica ──
  { id: 'p-north-male-1-snorkel',  propertyId: 'p-north-male-1', name: 'Snorkeling Trip',     iconName: 'Fish',     defaultPrice: 70,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-1-dive',     propertyId: 'p-north-male-1', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 120, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-1-dolphin',  propertyId: 'p-north-male-1', name: 'Dolphin Cruise',      iconName: 'Heart',    defaultPrice: 65,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-1-dinner',   propertyId: 'p-north-male-1', name: 'Private Beach Dinner',iconName: 'Utensils', defaultPrice: 180, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-1-spa',      propertyId: 'p-north-male-1', name: 'Traditional Spa',     iconName: 'Flower2',  defaultPrice: 150, duration: '90 min',   activeMonths: ALL_MONTHS },
  // ── Baros Maldives ──
  { id: 'p-north-male-2-snorkel',  propertyId: 'p-north-male-2', name: 'House Reef Snorkel',  iconName: 'Fish',     defaultPrice: 65,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-2-dive',     propertyId: 'p-north-male-2', name: 'Scuba Diving',        iconName: 'Anchor',   defaultPrice: 130, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-2-dinner',   propertyId: 'p-north-male-2', name: 'Private Beach Dinner',iconName: 'Utensils', defaultPrice: 200, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-north-male-2-spa',      propertyId: 'p-north-male-2', name: 'Signature Spa',       iconName: 'Flower2',  defaultPrice: 170, duration: '90 min',   activeMonths: ALL_MONTHS },
  { id: 'p-north-male-2-sandbank', propertyId: 'p-north-male-2', name: 'Sandbank Sundowner',  iconName: 'Wind',     defaultPrice: 120, duration: 'Evening',  activeMonths: ALL_MONTHS },
  // ── Kuredu Island Resort ──
  { id: 'p-lhaviyani-1-dive',      propertyId: 'p-lhaviyani-1', name: 'Scuba Diving',         iconName: 'Anchor',   defaultPrice: 110, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-lhaviyani-1-snorkel',   propertyId: 'p-lhaviyani-1', name: 'Snorkeling Trip',      iconName: 'Fish',     defaultPrice: 55,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-lhaviyani-1-dinner',    propertyId: 'p-lhaviyani-1', name: 'Private Beach Dinner', iconName: 'Utensils', defaultPrice: 160, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-lhaviyani-1-dolphin',   propertyId: 'p-lhaviyani-1', name: 'Dolphin Cruise',       iconName: 'Heart',    defaultPrice: 60,  duration: '2 hours',  activeMonths: ALL_MONTHS },
  // ── Mövenpick Kuredhivaru ──
  { id: 'p-raa-1-dive',     propertyId: 'p-raa-1', name: 'Scuba Diving',          iconName: 'Anchor',   defaultPrice: 120, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-raa-1-snorkel',  propertyId: 'p-raa-1', name: 'House Reef Snorkel',    iconName: 'Fish',     defaultPrice: 60,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-raa-1-sunset',   propertyId: 'p-raa-1', name: 'Sunset Fishing',        iconName: 'Sun',      defaultPrice: 55,  duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-raa-1-dinner',   propertyId: 'p-raa-1', name: 'Private Beach Dinner',  iconName: 'Utensils', defaultPrice: 170, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-raa-1-spa',      propertyId: 'p-raa-1', name: 'Traditional Spa',       iconName: 'Flower2',  defaultPrice: 140, duration: '90 min',   activeMonths: ALL_MONTHS },
  // ── Velaa Private Island ──
  { id: 'p-noonu-1-dive',     propertyId: 'p-noonu-1', name: 'Scuba Diving',          iconName: 'Anchor',   defaultPrice: 180, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-noonu-1-manta',    propertyId: 'p-noonu-1', name: 'Manta Ray Snorkel',     iconName: 'Sparkles', defaultPrice: 150, duration: 'Half day', activeMonths: [5,6,7,8,9,10,11] },
  { id: 'p-noonu-1-dinner',   propertyId: 'p-noonu-1', name: 'Private Beach Dinner',  iconName: 'Utensils', defaultPrice: 350, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-noonu-1-spa',      propertyId: 'p-noonu-1', name: 'Velaa Spa',             iconName: 'Flower2',  defaultPrice: 280, duration: '90 min',   activeMonths: ALL_MONTHS },
  { id: 'p-noonu-1-photo',    propertyId: 'p-noonu-1', name: 'Photography Tour',      iconName: 'Camera',   defaultPrice: 250, duration: 'Full day', activeMonths: ALL_MONTHS },
  // ── Cheval Blanc Randheli ──
  { id: 'p-noonu-2-dive',     propertyId: 'p-noonu-2', name: 'Scuba Diving',          iconName: 'Anchor',   defaultPrice: 200, duration: '4 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-noonu-2-snorkel',  propertyId: 'p-noonu-2', name: 'House Reef Snorkel',    iconName: 'Fish',     defaultPrice: 100, duration: '3 hours',  activeMonths: ALL_MONTHS },
  { id: 'p-noonu-2-dinner',   propertyId: 'p-noonu-2', name: 'Private Beach Dinner',  iconName: 'Utensils', defaultPrice: 400, duration: 'Evening',  activeMonths: ALL_MONTHS },
  { id: 'p-noonu-2-spa',      propertyId: 'p-noonu-2', name: 'Maison de Beauté Spa',  iconName: 'Flower2',  defaultPrice: 320, duration: '90 min',   activeMonths: ALL_MONTHS },
  { id: 'p-noonu-2-photo',    propertyId: 'p-noonu-2', name: 'Photography Tour',      iconName: 'Camera',   defaultPrice: 300, duration: 'Full day', activeMonths: ALL_MONTHS },
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
  { n: 3, label: 'Stay' },
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
const STORAGE_KEY = 'faru_trip_v4';

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
  const { t } = useTranslation();
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
        properties: tripData?.selectedProperties ?? [],
        islandNames: tripData?.islandNames ?? '',
        nightsPerProperty: tripData?.nightsPerIsland ?? {},
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
        <div className="px-5 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: C.coral }}>
              {t('modal.badge')}
            </div>
            <h2 id="modal-title" className="font-display text-2xl mt-0.5" style={{ color: C.navy }}>
              {t('modal.heading')}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Close">
            <X className="w-4 h-4" style={{ color: C.textMid }} />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6 max-h-[75vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🌴</div>
              <h3 className="font-display text-2xl mb-2" style={{ color: C.navy }}>{t('modal.successHeading')}</h3>
              <p className="text-sm mb-5" style={{ color: C.textMid }}>{t('modal.successBody')}</p>
              <div className="inline-block px-5 py-2.5 rounded-full text-sm font-medium mb-4" style={{ background: C.cream, color: C.navy }}>
                {t('modal.reference')} <span className="font-display text-base">{bookingRef}</span>
              </div>
              <p className="text-xs" style={{ color: C.textLight }}>{t('modal.referenceNote')}</p>
              <button onClick={onClose} className="mt-6 px-8 py-3 rounded-full text-white text-sm font-semibold block mx-auto transition-transform hover:scale-105" style={{ background: C.navy }}>
                {t('modal.backToTrip')}
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl mb-6 text-sm" style={{ background: C.sand }}>
                <div className="font-semibold mb-1" style={{ color: C.navy }}>{summary.title}</div>
                <div className="text-xs mb-2" style={{ color: C.textLight }}>{summary.detail}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-xl" style={{ color: C.navy }}>${summary.totalWithGst.toLocaleString()}</span>
                  <span className="text-xs" style={{ color: C.textLight }}>{t('modal.inclGST')}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[['firstName', t('modal.firstName'), 'Amira', 'given-name'], ['lastName', t('modal.lastName'), 'Hassan', 'family-name']].map(([f, label, ph, ac]) => (
                    <div key={f}>
                      <label htmlFor={f} className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                      <input id={f} value={form[f]} onChange={setField(f)} className="w-full px-4 py-2.5 rounded-xl border text-sm" style={inputStyle(f)} placeholder={ph} autoComplete={ac} />
                      {errors[f] && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors[f]}</p>}
                    </div>
                  ))}
                </div>

                {[['email', t('modal.email'), 'you@example.com', 'email', 'email'], ['phone', t('modal.phone'), '+1 234 567 8900', 'tel', 'tel']].map(([f, label, ph, type, ac]) => (
                  <div key={f} className="mb-4">
                    <label htmlFor={f} className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>{label}</label>
                    <input id={f} type={type} value={form[f]} onChange={setField(f)} className="w-full px-4 py-2.5 rounded-xl border text-sm" style={inputStyle(f)} placeholder={ph} autoComplete={ac} />
                    {errors[f] && <p className="text-xs mt-1" style={{ color: C.error }} role="alert">{errors[f]}</p>}
                  </div>
                ))}

                <div className="mb-6">
                  <label htmlFor="notes" className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: C.textLight }}>
                    {t('modal.specialRequests')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{t('modal.optional')}</span>
                  </label>
                  <textarea id="notes" value={form.notes} onChange={setField('notes')} className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none" style={{ borderColor: C.border, color: C.navy, outline: 'none', fontFamily: 'inherit' }} rows={3} placeholder="Anniversary, dietary needs, accessibility..." />
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                  {t('modal.submitBtn')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <p className="text-xs text-center mt-3" style={{ color: C.textLight }}>
                  {t('modal.noPayment')}
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

function FeaturedCard({ pkg, onClick, onShare }) {
  const { t } = useTranslation();
  return (
    <div
      className="relative text-left rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group w-full active:scale-[0.97] cursor-pointer"
      style={{ boxShadow: '0 4px 20px rgba(12,52,65,0.10)' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Start ${pkg.name} package`}
    >
      {/* Image */}
      <div className="relative h-[100px] sm:h-44 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,52,65,0.7) 0%, rgba(12,52,65,0.1) 60%, transparent 100%)' }} />
        {/* Badge */}
        <span
          className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px] sm:text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white"
          style={{ background: pkg.badgeColor }}
        >
          {t(`fp.${pkg.id}_badge`)}
        </span>
        {/* Emoji — bottom right, mobile only */}
        <span className="sm:hidden absolute bottom-2 right-2.5 text-xl leading-none" aria-hidden="true">{pkg.emoji}</span>
        {/* Share button */}
        <button
          onClick={e => { e.stopPropagation(); onShare(); }}
          className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)' }}
          aria-label={`Share ${t(`fp.${pkg.id}_name`)}`}
        >
          <Share2 className="w-3 h-3 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-5" style={{ background: 'white' }}>
        <h3 className="font-display text-sm sm:text-lg leading-tight mb-0.5 sm:mb-1" style={{ color: C.navy }}>
          {t(`fp.${pkg.id}_name`)}
        </h3>
        <p className="hidden sm:block text-xs leading-snug mb-3" style={{ color: C.textMid }}>
          {t(`fp.${pkg.id}_tagline`)}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-4">
          {pkg.highlights.slice(0, 2).map(h => (
            <span
              key={h}
              className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full"
              style={{ background: C.sand, color: pkg.accentColor }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold transition-all group-hover:gap-2 sm:group-hover:gap-3"
          style={{ color: pkg.accentColor }}
        >
          <span className="sm:hidden">{t('s1.start')}</span>
          <span className="hidden sm:inline">{t('s1.startTrip')}</span>
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
        </div>
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
            { icon: MapPin, label: 'Based in', value: 'Malé, Republic of Maldives', sub: 'Open Mon — Sat, 9am — 6pm' },
            { icon: Heart, label: 'WhatsApp', value: '+960 300 0000', sub: 'Fastest way to reach us' },
            { icon: Sun, label: 'Email', value: 'hello@wavevoyages.com', sub: 'We reply within 24 hours' },
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

/* ========== DATE RANGE PICKER ========== */

function DateRangePicker({ from, to, onChange }) {
  const [hovered, setHovered] = useState(null);
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const initDate = from || today;
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const MNAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WDAYS  = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const months = [
    { y: viewYear,  m: viewMonth },
    { y: viewMonth === 11 ? viewYear + 1 : viewYear, m: (viewMonth + 1) % 12 },
  ];

  const nav = dir => {
    setViewMonth(prev => {
      const n = prev + dir;
      if (n < 0)  { setViewYear(y => y - 1); return 11; }
      if (n > 11) { setViewYear(y => y + 1); return 0; }
      return n;
    });
  };

  const handleClick = day => {
    if (day < today) return;
    if (!from || (from && to)) {
      onChange({ from: day, to: undefined });
    } else {
      if (day < from) onChange({ from: day, to: undefined });
      else onChange({ from, to: day });
    }
  };

  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

  const getDays = (y, m) => {
    const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
    const total    = new Date(y, m + 1, 0).getDate();
    const cells    = Array(firstDow).fill(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));
    return cells;
  };

  return (
    <div className="select-none" onMouseLeave={() => setHovered(null)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button onClick={() => nav(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
          style={{ color: C.navy }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-4 sm:gap-16">
          {months.map(({ y, m }, i) => (
            <span key={i} className={`font-semibold text-sm sm:text-base tracking-wide ${i === 1 ? 'hidden sm:inline' : ''}`}
              style={{ color: C.navy }}>
              {MNAMES[m]} {y}
            </span>
          ))}
        </div>
        <button onClick={() => nav(1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
          style={{ color: C.navy }}>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
        {months.map(({ y, m }, mi) => {
          const days = getDays(y, m);
          return (
            <div key={mi} className={mi === 1 ? 'hidden sm:block' : ''}>
              <div className="grid grid-cols-7 mb-1">
                {WDAYS.map(w => (
                  <div key={w} className="h-8 flex items-center justify-center text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: C.textLight }}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day, di) => {
                  if (!day) return <div key={`e${di}`} className="h-10" />;
                  const past        = day < today;
                  const isStart     = sameDay(day, from);
                  const isEnd       = sameDay(day, to);
                  const isToday     = sameDay(day, today);
                  const previewEnd  = !to && from && hovered && hovered > from ? hovered : null;
                  const rangeEnd    = to || previewEnd;
                  const inRange     = from && rangeEnd && day > from && day < rangeEnd;
                  const isPreview   = sameDay(day, previewEnd) && !to;

                  let stripBg = 'transparent';
                  if (inRange)                  stripBg = '#fde8d8';
                  else if (isStart && rangeEnd) stripBg = 'linear-gradient(90deg, transparent 50%, #fde8d8 50%)';
                  else if (isEnd || isPreview)  stripBg = 'linear-gradient(90deg, #fde8d8 50%, transparent 50%)';

                  let btnBg    = 'transparent';
                  let btnColor = past ? '#cbd5e1' : isToday ? C.coral : C.textDark;
                  let btnFw    = isToday ? '600' : '400';
                  if (isStart)         { btnBg = C.coral;   btnColor = 'white'; btnFw = '700'; }
                  else if (isEnd)      { btnBg = C.copper;  btnColor = 'white'; btnFw = '700'; }
                  else if (isPreview)  { btnBg = '#fbd0b4'; btnColor = C.navy;  btnFw = '500'; }

                  return (
                    <div key={`${y}-${m}-${di}`} className="h-10 flex items-center justify-center"
                      style={{ background: stripBg }}
                      onMouseEnter={() => !past && setHovered(day)}>
                      <button
                        onClick={() => handleClick(day)}
                        disabled={past}
                        className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-100 disabled:cursor-default hover:ring-2 active:scale-95"
                        style={{
                          background: btnBg,
                          color: btnColor,
                          fontWeight: btnFw,
                          opacity: past ? 0.25 : 1,
                          '--tw-ring-color': C.coral + '55',
                        }}>
                        {day.getDate()}
                        {isToday && !isStart && !isEnd && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                            style={{ background: C.coral }} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== MAIN APP ========== */

export default function App() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'en');

  const switchLang = (l) => {
    i18nInstance.changeLanguage(l);
    localStorage.setItem('wv_lang', l);
    setLang(l);
  };

  const saved = useRef(loadSavedState()).current || {};

  const [step, setStep]                       = useState(saved.step ?? 1);
  const [packageType, setPackageType]         = useState(saved.packageType ?? null);
  const [arrivalDate, setArrivalDate]         = useState(saved.arrivalDate ?? null);
  const [departureDate, setDepartureDate]     = useState(saved.departureDate ?? null);
  const [guests, setGuests]                   = useState(saved.guests ?? 2);
  const [destinationSlots, setDestinationSlots] = useState(
    saved.destinationSlots ?? [{ islandId: null, propertyId: null }]
  );
  const [nightsPerIsland, setNightsPerIsland]   = useState(saved.nightsPerIsland ?? {});
  const [activityQty, setActivityQty]           = useState(saved.activityQty ?? {});
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  const [toasts, setToasts]                     = useState([]);
  const [showModal, setShowModal]               = useState(false);
  const [currentPage, setCurrentPage]           = useState('home');

  /* live Firestore catalog */
  const [liveIslands, setLiveIslands]         = useState(null);
  const [liveActivities, setLiveActivities]   = useState(null);
  const [liveCurated, setLiveCurated]         = useState(null);
  const [liveSettings, setLiveSettings]       = useState(null);
  const [liveProperties, setLiveProperties]   = useState(null);
  const [liveExperiences, setLiveExperiences] = useState(null);

  const prevKey  = useRef('');
  const toastId  = useRef(0);

  /* --- Derived from dates --- */
  const nights = useMemo(() => {
    if (!arrivalDate || !departureDate) return 7;
    const d = Math.round((new Date(departureDate) - new Date(arrivalDate)) / 86400000);
    return Math.max(1, d);
  }, [arrivalDate, departureDate]);

  const travelMonth = useMemo(() => {
    if (!arrivalDate) return null;
    return new Date(arrivalDate).getMonth() + 1;
  }, [arrivalDate]);

  /* --- Seed expandedActivities when entering step 5 --- */
  useEffect(() => {
    if (step === 5) {
      setExpandedActivities(prev => {
        const next = new Set(prev);
        selectedProperties.forEach(propId => {
          const hasSel = Object.keys(activityQty).some(k => k.startsWith(`${propId}:`) && activityQty[k] > 0);
          if (hasSel) next.add(propId);
        });
        return next;
      });
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- Persist --- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, packageType, arrivalDate, departureDate, guests, destinationSlots, nightsPerIsland, activityQty }));
    } catch {}
  }, [step, packageType, arrivalDate, departureDate, guests, destinationSlots, nightsPerIsland, activityQty]);

  /* --- Live catalog from Firestore --- */
  useEffect(() => {
    const reshape = docs => {
      const flat = docs.map(d => ({ id: d.id, ...d.data() }));
      if (!flat.length) return null;
      return {
        local:  flat.filter(i => i.packageType === 'local'  && i.active !== false).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0)),
        resort: flat.filter(i => i.packageType === 'resort' && i.active !== false).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0)),
      };
    };
    const u1 = onSnapshot(collection(db, 'islands'),  s => { const r = reshape(s.docs); if (r) setLiveIslands(r); });
    const u2 = onSnapshot(query(collection(db, 'activities'), orderBy('sortOrder')), s => {
      const flat = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.active !== false);
      if (flat.length) setLiveActivities(flat);
    });
    const u3 = onSnapshot(query(collection(db, 'curatedPackages'), orderBy('sortOrder')), s => {
      const flat = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active !== false);
      if (flat.length) setLiveCurated(flat);
    });
    const u4 = onSnapshot(doc(db, 'settings', 'app'), d => { if (d.exists()) setLiveSettings(d.data()); });
    const u5 = onSnapshot(query(collection(db, 'properties'), orderBy('sortOrder')), s => {
      const flat = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active !== false);
      if (flat.length) setLiveProperties(flat);
    });
    const u6 = onSnapshot(query(collection(db, 'experiences'), orderBy('sortOrder')), s => {
      const flat = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.active !== false);
      if (flat.length) setLiveExperiences(flat);
    });
    return () => { u1(); u2(); u3(); u4(); u5(); u6(); };
  }, []);

  /* resolved catalog — Firestore when available, hardcoded fallback */
  const resolvedIslands    = liveIslands    ?? ISLANDS;
  const resolvedActivities = liveActivities ?? DEMO_EXPERIENCES;
  const resolvedCurated    = liveCurated    ?? FEATURED;
  const resolvedSettings   = liveSettings   ?? { gstRate: GST_RATE, transferCostLocal: 45, transferCostResort: 180 };
  const resolvedProperties = liveProperties ?? PROPERTIES;

  /* --- Derived --- */
  const islandById = useMemo(() => {
    const map = {};
    [...(resolvedIslands.local || []), ...(resolvedIslands.resort || [])].forEach(i => { map[i.id] = i; });
    return map;
  }, [resolvedIslands]);

  const propertyById = useMemo(() => {
    const map = {};
    resolvedProperties.forEach(p => { map[p.id] = p; });
    return map;
  }, [resolvedProperties]);

  const selectedProperties = useMemo(
    () => destinationSlots.map(d => d.propertyId).filter(Boolean),
    [destinationSlots]
  );

  const pkg     = PACKAGES.find(p => p.id === packageType);
  const islands = packageType ? (resolvedIslands[packageType] || []) : [];

  /* --- Night allocation --- */
  useEffect(() => {
    const key = selectedProperties.join(',') + '|' + nights;
    if (key === prevKey.current) return;
    prevKey.current = key;
    if (!selectedProperties.length) { setNightsPerIsland({}); return; }
    const dist = {};
    if (selectedProperties.length > nights) {
      selectedProperties.forEach((id, i) => { if (i < nights) dist[id] = 1; });
    } else {
      const base = Math.floor(nights / selectedProperties.length);
      const rem  = nights % selectedProperties.length;
      selectedProperties.forEach((id, i) => { dist[id] = base + (i < rem ? 1 : 0); });
    }
    setNightsPerIsland(dist);
  }, [selectedProperties, nights]);

  /* --- Activity cleanup with toasts --- */
  useEffect(() => {
    setActivityQty(prev => {
      const out = {}, removed = [];
      Object.entries(prev).forEach(([key, qty]) => {
        const [propId, activityId] = key.split(':');
        if (!selectedProperties.includes(propId)) return;
        const islandId = propertyById[propId]?.islandId;
        let activity;
        if (liveExperiences) {
          activity = liveExperiences.find(e => e.id === activityId && e.propertyId === propId);
        } else {
          activity = resolvedActivities.find(a => a.id === activityId);
          if (activity && !isActivityAvailableAt(activity, islandId)) activity = null;
        }
        if (!activity) return;
        if (!isActivityInSeason(activity, travelMonth)) { removed.push(activity.name); return; }
        const cap = nightsPerIsland[propId] || 0;
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
  }, [selectedProperties, travelMonth, nightsPerIsland, propertyById, liveExperiences]);

  /* --- Costs --- */
  const stayCost = useMemo(() =>
    selectedProperties.reduce((sum, id) => {
      const prop = propertyById[id];
      const base = prop?.pricePerNight ?? (packageType === 'resort' ? 520 : 80);
      return sum + base * (nightsPerIsland[id] || 0) * guests;
    }, 0),
  [selectedProperties, propertyById, nightsPerIsland, guests, packageType]);

  const transferCost = useMemo(() => {
    if (selectedProperties.length <= 1) return 0;
    const rate = packageType === 'resort'
      ? (resolvedSettings.transferCostResort ?? 180)
      : (resolvedSettings.transferCostLocal  ?? 45);
    return (selectedProperties.length - 1) * rate * guests;
  }, [selectedProperties, packageType, guests, resolvedSettings]);

  const activitiesCost = useMemo(() =>
    Object.entries(activityQty).reduce((sum, [key, qty]) => {
      const [propId, actId] = key.split(':');
      let price = 0;
      if (liveExperiences) {
        const exp = liveExperiences.find(e => e.id === actId && e.propertyId === propId);
        price = exp?.defaultPrice ?? 0;
      } else {
        const islandId = propertyById[propId]?.islandId;
        const a = resolvedActivities.find(x => x.id === actId);
        if (!a || !islandId) return sum;
        price = a.prices?.[islandId] ?? a.defaultPrice ?? a.price ?? 0;
      }
      return sum + price * qty * guests;
    }, 0),
  [activityQty, guests, resolvedActivities, propertyById, liveExperiences]);

  const gstRate      = resolvedSettings.gstRate ?? GST_RATE;
  const subtotal     = stayCost + transferCost + activitiesCost;
  const gst          = Math.round(subtotal * gstRate);
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
    if (!selectedProperties.length) return;
    const base = Math.floor(nights / selectedProperties.length);
    const rem  = nights % selectedProperties.length;
    const dist = {};
    selectedProperties.forEach((id, i) => { dist[id] = base + (i < rem ? 1 : 0); });
    setNightsPerIsland(dist);
  };

  /* --- Destination slot interactions --- */
  const updateDestIsland = (idx, islandId) =>
    setDestinationSlots(prev => prev.map((d, i) =>
      i !== idx ? d : { islandId, propertyId: propertyById[d.propertyId]?.islandId === islandId ? d.propertyId : null }
    ));

  const selectPropertyForSlot = (idx, propId) =>
    setDestinationSlots(prev => prev.map((d, i) =>
      i !== idx ? d : { ...d, propertyId: d.propertyId === propId ? null : propId }
    ));

  const addDestinationSlot = () =>
    setDestinationSlots(prev => [...prev, { islandId: null, propertyId: null }]);

  const removeDestinationSlot = idx =>
    setDestinationSlots(prev => prev.filter((_, i) => i !== idx));
  const updateActivity = (propId, activityId, delta) => {
    const key = `${propId}:${activityId}`;
    setActivityQty(prev => {
      const cur  = prev[key] || 0;
      const cap  = nightsPerIsland[propId] || 0;
      const next = Math.max(0, Math.min(cap, cur + delta));
      if (next === 0) { const { [key]: _, ...rest } = prev; return rest; }
      return { ...prev, [key]: next };
    });
  };

  const dismissToast = id => setToasts(t => t.filter(x => x.id !== id));

  const resetTrip = () => {
    setStep(1); setPackageType(null); setArrivalDate(null); setDepartureDate(null); setGuests(2);
    setDestinationSlots([{ islandId: null, propertyId: null }]); setNightsPerIsland({}); setActivityQty({});
    prevKey.current = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  /* --- Share helpers --- */
  const shareContent = async ({ title, text }) => {
    const url = 'https://faru-co.vercel.app';
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        const id = ++toastId.current;
        setToasts(t => [...t, { id, message: 'Copied to clipboard!' }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
      } catch {}
    }
  };

  const shareFeaturedPackage = fp => shareContent({
    title: `${fp.name} — Wave Voyages`,
    text: `${fp.name}: ${fp.highlights.join(' · ')}. Design your own Maldives trip on Wave Voyages`,
  });

  const shareMyTrip = () => shareContent({
    title: 'My Maldives trip — Wave Voyages',
    text: `${nights} nights in the Maldives · ${monthLabel ?? ''} · ${islandNames || (pkg?.name ?? '')} · designed on Wave Voyages`,
  });

  /* --- Apply featured package --- */
  const applyFeaturedPackage = fp => {
    setPackageType(fp.packageType);
    setGuests(fp.guests);
    // Pre-fill dates: next occurrence of the package's suggested month
    const today = new Date();
    let year = today.getFullYear();
    if (fp.month <= today.getMonth() + 1) year += 1;
    const arrival = new Date(year, fp.month - 1, 10);
    const departure = new Date(arrival);
    departure.setDate(departure.getDate() + fp.nights);
    setArrivalDate(arrival.toISOString().split('T')[0]);
    setDepartureDate(departure.toISOString().split('T')[0]);
    setDestinationSlots(fp.islands.map(iid => ({
      islandId: iid,
      propertyId: resolvedProperties.find(p => p.islandId === iid)?.id ?? null,
    })));
    prevKey.current = '';
    setStep(4);
    try { updateDoc(doc(db, 'curatedPackages', fp.id), { 'stats.clicks': increment(1) }); } catch {}
  };

  /* --- Validation --- */
  const canAdvance = () => {
    if (step === 1) return !!packageType;
    if (step === 2) return !!arrivalDate && !!departureDate;
    if (step === 3) return selectedProperties.length > 0 && selectedProperties.length <= nights;
    if (step === 4) return allocatedOk;
    return true;
  };

  const getStepError = () => {
    if (step === 1) return 'Pick a style of stay to keep going.';
    if (step === 2) return 'Pick your arrival and departure dates to continue.';
    if (step === 3) {
      if (!selectedProperties.length) return 'Pick at least one property.';
      if (selectedProperties.length > nights) return `${selectedProperties.length} properties but only ${nights} nights — deselect one or add more nights.`;
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
      const [propId, activityId] = key.split(':');
      if (!groups[propId]) groups[propId] = [];
      const a = resolvedActivities.find(x => x.id === activityId);
      if (a) groups[propId].push({ ...a, qty, key });
    });
    return groups;
  }, [activityQty]);

  const monthLabel = travelMonth ? MONTHS.find(m => m.n === travelMonth).name : null;
  const stepError  = canAdvance() ? null : getStepError();

  const islandNames = selectedProperties.map(id => propertyById[id]?.name).filter(Boolean).join(', ');

  const bookingSummary = {
    title:  `${pkg?.name ?? ''} · ${monthLabel ?? ''}`,
    detail: `${nights} nights · ${guests} traveler${guests !== 1 ? 's' : ''} · ${islandNames || 'No islands'}`,
    subtotal, gst, totalWithGst,
  };

  const bookingTripData = {
    packageType, nights, guests, travelMonth, monthName: monthLabel,
    arrivalDate, departureDate,
    selectedProperties, islandNames, nightsPerIsland, activityQty,
  };

  /* --- Navigate from Destinations to wizard --- */
  const planFromIsland = (type, islandId) => {
    setPackageType(type);
    const propId = resolvedProperties.find(p => p.islandId === islandId)?.id ?? null;
    setDestinationSlots([{ islandId, propertyId: propId }]);
    prevKey.current = '';
    setStep(2);
    setCurrentPage('home');
  };

  /* ===== RENDER ===== */
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: C.sand, fontFamily: "'Manrope', sans-serif" }}>

      {/* ===== HEADER ===== */}
      <header className="border-b backdrop-blur-sm sticky top-0 z-30" style={{ borderColor: C.border, background: 'rgba(255,249,240,0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="Go home">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ background: C.navy }}>
              <Waves className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="font-display text-xl leading-none" style={{ color: C.navy }}>
                Wave Voyages<span className="font-display-italic">.</span>
              </div>
              <div className="text-[9px] tracking-[0.25em] uppercase mt-0.5" style={{ color: C.textLight }}>
                {t('nav.tagline')}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switcher */}
            <div className="flex items-center rounded-full border overflow-hidden" style={{ borderColor: C.border }}>
              {[['en', 'EN'], ['zh', '中文'], ['ru', 'РУС']].map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => switchLang(code)}
                  className="px-2.5 py-1 text-[10px] font-bold tracking-wide transition-colors"
                  style={{
                    background: lang === code ? C.navy : 'transparent',
                    color: lang === code ? 'white' : C.textLight,
                  }}
                  aria-label={`Switch to ${label}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: C.textMid }}>
              {[['destinations', t('nav.destinations')], ['journal', t('nav.journal')], ['contact', t('nav.contact')]].map(([page, label]) => (
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
                aria-label={t('nav.startOver')}
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">{t('nav.startOver')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== OTHER PAGES ===== */}
      {currentPage === 'admin' && <AdminPanel onBack={() => setCurrentPage('home')} />}
      {currentPage === 'destinations' && <DestinationsPage onPlanTrip={planFromIsland} />}
      {currentPage === 'journal' && <JournalPage />}
      {currentPage === 'contact' && <ContactPage />}

      {/* ===== WIZARD (home) ===== */}
      {currentPage === 'home' && <>
      {/* ===== HERO ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-12 pb-2 sm:pb-8 min-w-0 w-full">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-3 sm:mb-10">
          <div>
            <div
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] uppercase mb-4 px-3 py-1.5 rounded-full"
              style={{ background: C.gold + '33', color: '#9a6f00' }}
            >
              <Zap className="w-3 h-3" aria-hidden="true" />
              {t('hero.badge')}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-2 sm:mb-3" style={{ color: C.navy }}>
              {t('hero.h1a')}{' '}
              <span className="font-display-italic" style={{ color: C.coral }}>{t('hero.h1b')}</span> {t('hero.h1c')}
            </h1>
            <p className="hidden sm:block text-base max-w-md" style={{ color: C.textMid }}>
              {t('hero.sub')}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: 'white', color: C.textLight, boxShadow: '0 2px 12px rgba(12,52,65,0.08)' }}>
            <MapPin className="w-4 h-4" style={{ color: C.coral }} aria-hidden="true" />
            {t('hero.location')}
          </div>
        </div>

        {/* Step progress */}
        <div className="border-t border-b" style={{ borderColor: C.border }}>
          {/* Mobile: thin progress bar */}
          <div className="sm:hidden px-0 pt-2 pb-2">
            <div className="h-1 rounded-full mb-2" style={{ background: C.borderFaint }}>
              <div className="h-1 rounded-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%`, background: C.navy }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: C.textLight }}>{t('steps.label', { n: step })}</span>
              <span className="text-xs font-bold" style={{ color: C.navy }}>{t(`steps.${STEPS.find(s => s.n === step)?.label.toLowerCase()}`)}</span>
            </div>
          </div>
          {/* Desktop: dots + labels */}
          <nav aria-label="Booking steps" className="hidden sm:flex items-center gap-1 md:gap-3 w-full py-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 md:gap-3 flex-1">
                <button
                  onClick={() => s.n < step && setStep(s.n)}
                  className="flex items-center gap-2 min-w-0 disabled:cursor-default"
                  aria-label={`${t('steps.label', { n: s.n })}: ${t(`steps.${s.label.toLowerCase()}`)}`}
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
                  <span className="text-sm font-medium truncate" style={{ color: step >= s.n ? C.navy : C.textLight }}>
                    {t(`steps.${s.label.toLowerCase()}`)}
                  </span>
                </button>
                {i < STEPS.length - 1 && <div className="h-px flex-1" style={{ background: C.border }} aria-hidden="true" />}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-0 pb-4 lg:pb-20 grid lg:grid-cols-[1fr_380px] gap-10">
        <main className="min-w-0 w-full">
          <div className="fade-in" key={step}>

            {/* STEP 1: STYLE */}
            {step === 1 && (
              <section aria-label="Choose your style of stay">
                <h2 className="font-display text-xl sm:text-3xl mb-1 sm:mb-2" style={{ color: C.navy }}>{t('s1.heading')}</h2>
                <p className="hidden sm:block mb-8" style={{ color: C.textMid }}>{t('s1.sub')}</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  {PACKAGES.map(p => {
                    const sel = packageType === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPackageType(p.id)}
                        className="text-left w-full min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-200 border-2 group active:scale-[0.98]"
                        style={{
                          borderColor: sel ? C.navy : C.border,
                          background: p.id === 'local' ? C.cream : C.seafoam,
                          boxShadow: sel ? `0 0 0 3px ${C.navy}18` : 'none',
                        }}
                        aria-pressed={sel}
                      >
                        <div className="h-[90px] sm:h-48 relative overflow-hidden">
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={p.id === 'local' ? '/images/local-island.png' : '/images/private-resort.png'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          >
                            <source
                              src={p.id === 'local' ? '/videos/local-island.mp4' : '/videos/private-resort.mp4'}
                              type="video/mp4"
                            />
                          </video>
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(12,52,65,0.35) 0%, transparent 60%)' }} />
                          {sel && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg" style={{ background: C.teal }}>
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 sm:p-6">
                          <div className="text-[9px] sm:text-xs tracking-[0.15em] uppercase mb-0.5 font-semibold" style={{ color: C.coral }}>{t(`pkg.${p.id}_tagline`)}</div>
                          <h3 className="font-display text-sm sm:text-2xl leading-tight mb-1 sm:mb-1.5" style={{ color: C.navy }}>{t(`pkg.${p.id}_name`)}</h3>
                          <p className="hidden sm:block text-sm mb-3 leading-relaxed" style={{ color: C.textMid }}>{t(`pkg.${p.id}_desc`)}</p>
                          <div className="text-[11px] sm:text-sm" style={{ color: C.textLight }}>
                            {t('s1.fromPerNight')} <span className="font-display text-sm sm:text-xl" style={{ color: C.navy }}>${p.basePerNight}</span>{t('s1.perNight')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Keep going — right after the two cards (hidden on mobile; bottom bar handles it) */}
                <div className="hidden sm:flex justify-end mt-6">
                  <button
                    onClick={() => canAdvance() && setStep(2)}
                    disabled={!canAdvance()}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: C.navy }}
                  >
                    {t('s1.keepGoing')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6 sm:my-10">
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                  <span className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-full whitespace-nowrap" style={{ background: 'white', color: C.textLight, border: `1px solid ${C.border}` }}>
                    {t('s1.divider')}
                  </span>
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                </div>

                {/* Featured packages */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: C.coral }}>{t('s1.popularBadge')}</div>
                      <h2 className="font-display text-xl sm:text-2xl" style={{ color: C.navy }}>{t('s1.curatedHeading')}</h2>
                    </div>
                    <div className="text-xs hidden sm:block" style={{ color: C.textLight }}>{t('s1.curatedSub')}</div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {resolvedCurated.map(fp => (
                      <FeaturedCard key={fp.id} pkg={fp} onClick={() => applyFeaturedPackage(fp)} onShare={() => shareFeaturedPackage(fp)} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: DATES */}
            {step === 2 && (() => {
              const rangeFrom = arrivalDate ? new Date(arrivalDate + 'T00:00:00') : undefined;
              const rangeTo   = departureDate ? new Date(departureDate + 'T00:00:00') : undefined;
              const season    = travelMonth ? MONTHS.find(m => m.n === travelMonth)?.season : null;
              const fmtShort  = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
              const fmtFull   = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
              <section aria-label="Choose dates and guests">
                <h2 className="font-display text-2xl sm:text-3xl mb-1" style={{ color: C.navy }}>When are you going?</h2>
                <p className="text-sm mb-5" style={{ color: C.textMid }}>
                  {!arrivalDate ? 'Tap a date on the calendar to set your arrival.' : !departureDate ? 'Great — now tap your departure date.' : 'Looking good. Adjust anytime by clicking new dates.'}
                </p>

                {/* Guests */}
                <div className="rounded-xl sm:rounded-2xl px-4 py-3 mb-3 sm:mb-4 flex items-center justify-between" style={{ background: C.seafoam }}>
                  <div className="flex items-center gap-3">
                    <div className="text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: C.textLight }}>Travelers</div>
                    <div className="font-display text-2xl leading-none" style={{ color: C.navy }} aria-live="polite">{guests}</div>
                  </div>
                  <div className="flex gap-2">
                    {[[-1, 'Decrease travelers', guests <= 1], [1, 'Increase travelers', guests >= 12]].map(([d, label, dis]) => (
                      <button key={d} onClick={() => setGuests(g => Math.max(1, Math.min(12, g + d)))} disabled={dis}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-white/60 disabled:opacity-30 transition-all"
                        style={{ borderColor: 'rgba(12,52,65,0.2)', color: C.navy }} aria-label={label}>
                        {d < 0 ? <Minus className="w-3.5 h-3.5" aria-hidden="true" /> : <Plus className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date cards — compact on mobile, tall on desktop */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-5">
                  {/* Arrival */}
                  <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:p-4 border-2 transition-all"
                    style={{ borderColor: arrivalDate ? C.navy : C.border, background: arrivalDate ? C.navy : 'white' }}>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-semibold mb-0.5 sm:mb-1.5"
                      style={{ color: arrivalDate ? 'rgba(255,255,255,0.55)' : C.textLight }}>
                      Arrival
                    </div>
                    {arrivalDate ? (
                      <div className="flex items-baseline gap-1.5 sm:block">
                        <span className="font-display text-base sm:text-2xl leading-none" style={{ color: 'white' }}>
                          {rangeFrom.getDate()}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {rangeFrom.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="hidden sm:block text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {rangeFrom.toLocaleDateString('en-GB', { weekday: 'long' })}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-semibold" style={{ color: C.textLight }}>Not set</div>
                    )}
                  </div>

                  {/* Departure */}
                  <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:p-4 border-2 transition-all"
                    style={{ borderColor: departureDate ? C.teal : C.border, background: departureDate ? C.teal : 'white' }}>
                    <div className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-semibold mb-0.5 sm:mb-1.5"
                      style={{ color: departureDate ? 'rgba(255,255,255,0.55)' : C.textLight }}>
                      Departure
                    </div>
                    {departureDate ? (
                      <div className="flex items-baseline gap-1.5 sm:block">
                        <span className="font-display text-base sm:text-2xl leading-none" style={{ color: 'white' }}>
                          {rangeTo.getDate()}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {rangeTo.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="hidden sm:block text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {rangeTo.toLocaleDateString('en-GB', { weekday: 'long' })}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm font-semibold" style={{ color: C.textLight }}>Not set</div>
                    )}
                  </div>
                </div>

                {/* Nights + season row */}
                {arrivalDate && departureDate && (
                  <div className="flex items-center gap-2 mb-3 sm:mb-5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                      style={{ background: C.cream }}>
                      <span className="font-display text-base leading-none" style={{ color: C.navy }}>{nights}</span>
                      <span className="text-xs font-semibold" style={{ color: C.textMid }}>night{nights !== 1 ? 's' : ''}</span>
                    </div>
                    {season && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: season === 'dry' ? C.cream : '#ddf2ef', color: season === 'dry' ? C.copper : C.teal }}>
                        <span>{season === 'dry' ? '☀️' : '🌊'}</span>
                        <span className="hidden xs:inline">{season === 'dry' ? 'Dry season' : 'Wet season'}</span>
                      </div>
                    )}
                    <button onClick={() => { setArrivalDate(null); setDepartureDate(null); }}
                      className="ml-auto text-xs underline leading-none" style={{ color: C.textLight }}>Clear</button>
                  </div>
                )}

                {/* Calendar */}
                <div className="rounded-2xl sm:rounded-3xl border p-3 sm:p-6 mb-3 sm:mb-5" style={{ borderColor: C.border, background: 'white' }}>
                  <DateRangePicker
                    from={rangeFrom}
                    to={rangeTo}
                    onChange={r => {
                      setArrivalDate(r?.from ? r.from.toISOString().split('T')[0] : null);
                      setDepartureDate(r?.to ? r.to.toISOString().split('T')[0] : null);
                    }}
                  />
                </div>

                {/* Season info */}
                <div className="flex items-start gap-2 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 mb-3 sm:mb-5" style={{ background: C.sand }}>
                  <div className="text-base">🌤️</div>
                  <p className="text-xs leading-relaxed" style={{ color: C.textMid }}>
                    <strong style={{ color: C.navy }}>Dry season (Nov–Apr)</strong> — calm seas, sunny skies, peak visibility.{' '}
                    <strong style={{ color: C.navy }}>Wet season (May–Oct)</strong> — manta rays, whale sharks, fewer crowds, lower prices.
                  </p>
                </div>

              </section>
              );
            })()}

            {/* STEP 3: DESTINATION BUILDER */}
            {step === 3 && (
              <section aria-label="Choose destinations">
                <h2 className="font-display text-2xl sm:text-3xl mb-1" style={{ color: C.navy }}>{t('s3.heading')}</h2>
                <p className="text-xs sm:text-sm mb-5" style={{ color: C.textLight }}>{t('s3.subDesktop', { nights })}</p>

                {selectedProperties.length > nights && (
                  <div className="flex items-start gap-2 p-3 rounded-2xl mb-4 text-sm" style={{ background: C.warn, color: C.warnText }} role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t('s3.tooMany', { selected: selectedProperties.length, nights })}</span>
                  </div>
                )}

                {/* Destination slots */}
                <div className="space-y-4">
                  {destinationSlots.map((slot, idx) => {
                    const slotIsland    = islandById[slot.islandId];
                    const slotProps     = slot.islandId ? resolvedProperties.filter(p => p.islandId === slot.islandId) : [];
                    const confirmed     = !!slot.propertyId;
                    const selectedProp  = propertyById[slot.propertyId];
                    return (
                      <div key={idx} className="rounded-3xl border-2 overflow-hidden transition-all"
                        style={{ borderColor: confirmed ? C.teal : C.border, background: 'white' }}>

                        {/* Destination header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: confirmed ? C.teal : C.navy }}>
                              {confirmed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: C.textLight }}>
                                Destination {idx + 1}
                              </div>
                              {confirmed && (
                                <div className="text-sm font-semibold leading-tight" style={{ color: C.navy }}>
                                  {selectedProp?.name}
                                  <span className="font-normal text-xs ml-1.5" style={{ color: C.textLight }}>{slotIsland?.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {idx > 0 && (
                            <button onClick={() => removeDestinationSlot(idx)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                              style={{ color: C.textLight }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Island picker */}
                        <div className="px-4 pt-3 pb-2">
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.coral }} />
                            <select
                              value={slot.islandId ?? ''}
                              onChange={e => updateDestIsland(idx, e.target.value || null)}
                              className="w-full appearance-none pl-9 pr-9 py-2.5 rounded-xl border-2 text-sm font-semibold outline-none cursor-pointer transition-all"
                              style={{
                                borderColor: slot.islandId ? C.navy : C.border,
                                background: slot.islandId ? C.navy : C.sand,
                                color: slot.islandId ? 'white' : C.textMid,
                              }}>
                              <option value="">Select an island…</option>
                              {islands.map(island => (
                                <option key={island.id} value={island.id}>
                                  {island.name} — {island.atoll}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                              style={{ color: slot.islandId ? 'rgba(255,255,255,0.7)' : C.textLight }} />
                          </div>
                          {slotIsland && (
                            <p className="text-[11px] mt-1.5 px-1" style={{ color: C.textLight }}>
                              {slotIsland.atoll} · {slotIsland.note}
                            </p>
                          )}
                        </div>

                        {/* Property cards for this slot */}
                        {slotProps.length > 0 && (
                          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {slotProps.map(prop => {
                              const sel = slot.propertyId === prop.id;
                              return (
                                <button key={prop.id} onClick={() => selectPropertyForSlot(idx, prop.id)}
                                  className="text-left rounded-2xl border-2 p-3 transition-all duration-200 active:scale-[0.98] hover:shadow-md"
                                  style={{ borderColor: sel ? C.teal : C.border, background: sel ? '#f0faf8' : 'white' }}
                                  aria-pressed={sel}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm leading-snug" style={{ color: C.navy }}>{prop.name}</div>
                                      <div className="text-xs mt-0.5" style={{ color: C.textLight }}>{prop.note}</div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                                      style={{ borderColor: sel ? C.teal : C.border, background: sel ? C.teal : 'transparent' }}>
                                      {sel && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex gap-1 flex-wrap">
                                      {prop.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full font-medium"
                                          style={{ background: sel ? 'rgba(0,168,137,0.1)' : 'rgba(12,52,65,0.05)', color: sel ? C.teal : C.textMid }}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="font-display text-sm shrink-0" style={{ color: sel ? C.teal : C.navy }}>
                                      ${prop.pricePerNight.toLocaleString()}<span className="text-[10px] font-sans" style={{ color: C.textLight }}>/night</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add another island CTA */}
                {selectedProperties.length > 0 && selectedProperties.length < nights && (
                  <button onClick={addDestinationSlot}
                    className="mt-4 w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid hover:shadow-md group"
                    style={{ borderColor: C.teal, color: C.teal, background: 'transparent' }}>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors group-hover:bg-teal-50"
                      style={{ borderColor: C.teal }}>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    Want to travel to another island?
                  </button>
                )}
              </section>
            )}

            {/* STEP 4: ITINERARY */}
            {step === 4 && (
              <section aria-label="Plan nights per island">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <h2 className="font-display text-xl sm:text-3xl" style={{ color: C.navy }}>{t('s4.heading')}</h2>
                  <button onClick={redistributeEvenly}
                    className="flex items-center gap-1.5 text-xs tracking-wider uppercase px-4 py-2 rounded-full border font-semibold hover:bg-white transition-colors"
                    style={{ borderColor: C.border, color: C.navy }} aria-label={t('s4.splitEvenly')}>
                    <Shuffle className="w-3.5 h-3.5" aria-hidden="true" /> {t('s4.splitEvenly')}
                  </button>
                </div>
                <p className="sm:hidden text-xs mb-3" style={{ color: C.textLight }}>{t('s4.subMobile', { nights, count: selectedProperties.length, islandWord: t(selectedProperties.length === 1 ? 's4.island' : 's4.islands') })}</p>
                <p className="hidden sm:block mb-6 text-base" style={{ color: C.textMid }}>
                  {t('s4.subDesktop', { nights, count: selectedProperties.length, islandWord: t(selectedProperties.length === 1 ? 's4.island' : 's4.islands') })}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: C.textLight }}>
                    <span>{t('s4.allocated')}</span>
                    <span style={{ color: allocatedOk ? C.teal : C.coral }} aria-live="polite">{allocated} / {nights} {allocatedOk ? '✔' : ''}</span>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden" style={{ background: 'rgba(12,52,65,0.08)' }} role="img" aria-label={`${allocated} of ${nights} nights allocated`}>
                    {selectedProperties.map((id, i) => {
                      const n = nightsPerIsland[id] || 0;
                      return <div key={id} className="flex items-center justify-center text-[10px] font-bold text-white transition-all" style={{ width: `${(n/nights)*100}%`, background: ISLAND_COLORS[i % ISLAND_COLORS.length] }}>{(n/nights)*100 > 10 && `${n}n`}</div>;
                    })}
                  </div>
                </div>

                <div className="space-y-3 mt-3 sm:mt-6">
                  {selectedProperties.map((id, i) => {
                    const prop      = propertyById[id];
                    const islandName = prop?.islandName ?? islandById[prop?.islandId]?.name;
                    const atoll      = prop?.atoll      ?? islandById[prop?.islandId]?.atoll;
                    const n          = nightsPerIsland[id] || 0;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow" style={{ borderColor: C.border }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm text-white shrink-0" style={{ background: ISLAND_COLORS[i % ISLAND_COLORS.length] }} aria-hidden="true">{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base leading-snug truncate" style={{ color: C.navy }}>{prop?.name}</div>
                          <div className="text-xs flex items-center gap-2" style={{ color: C.textLight }}>
                            <span>{islandName}{atoll ? ` · ${atoll}` : ''}</span>
                            {i > 0 && <><span aria-hidden="true">·</span><span className="flex items-center gap-1"><Plane className="w-3 h-3" aria-hidden="true" />{t('s4.transfer')}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => adjustIslandNights(id, -1)} disabled={n <= 1} className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity" style={{ background: 'rgba(12,52,65,0.07)', color: C.navy }} aria-label={`Decrease nights at ${prop?.name}`}>
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <div className="font-display text-xl min-w-[2.5rem] text-center" style={{ color: C.navy }} aria-live="polite">{n}<span className="text-xs ml-0.5" style={{ color: C.textLight }}>n</span></div>
                          <button onClick={() => adjustIslandNights(id, 1)} disabled={allocated >= nights} className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity" style={{ background: C.navy }} aria-label={`Increase nights at ${prop?.name}`}>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STEP 5: EXPERIENCES */}
            {step === 5 && (
              <section aria-label="Add experiences">
                <h2 className="font-display text-2xl sm:text-3xl mb-2" style={{ color: C.navy }}>{t('s5.heading')}</h2>
                <p className="mb-5 sm:mb-8 text-sm sm:text-base" style={{ color: C.textMid }}>
                  {t('s5.sub')}{' '}
                  <span className="font-semibold" style={{ color: C.navy }}>{monthLabel}</span>.
                </p>

                <div className="space-y-8">
                  {selectedProperties.map((propId, idx) => {
                    const prop       = propertyById[propId];
                    const islandId   = prop?.islandId;
                    const islandName = prop?.islandName ?? islandById[islandId]?.name;
                    const n        = nightsPerIsland[propId] || 0;
                    const dayStart = selectedProperties.slice(0, idx).reduce((a, id) => a + (nightsPerIsland[id] || 0), 0) + 1;
                    const dayEnd   = dayStart + n - 1;
                    const propActivities = liveExperiences
                      ? liveExperiences.filter(e => e.propertyId === propId)
                      : resolvedActivities.filter(a => isActivityAvailableAt(a, islandId));
                    const inSeason  = propActivities.filter(a => isActivityInSeason(a, travelMonth));
                    const offSeason = propActivities.filter(a => !isActivityInSeason(a, travelMonth));
                    return (
                      <div key={propId}>
                        <div className="flex items-end justify-between mb-4 pb-3 border-b" style={{ borderColor: C.border }}>
                          <div>
                            <div className="text-xs tracking-[0.3em] uppercase mb-1 font-bold" style={{ color: C.coral }}>
                              {t('s5.days')} {dayStart}{n > 1 ? `—${dayEnd}` : ''} · {n} {n === 1 ? t('s5.night') : t('s5.nights')}
                            </div>
                            <h3 className="font-display text-lg sm:text-2xl" style={{ color: C.navy }}>
                              {prop?.name} <span className="font-display-italic text-sm sm:text-base" style={{ color: C.textLight }}>· {islandName}</span>
                            </h3>
                          </div>
                          <div className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: C.cream, color: C.textMid }}>
                            {n === 1 ? t('s5.maxActivity', { n }) : t('s5.maxActivities', { n })}
                          </div>
                        </div>

                        {/* Activity grid — toggle via expandedActivities */}
                        {(() => {
                          const isExpanded = expandedActivities.has(propId);
                          const collapse   = () => setExpandedActivities(prev => { const s = new Set(prev); s.delete(propId); return s; });
                          const expand     = () => setExpandedActivities(prev => new Set([...prev, propId]));
                          return (
                            <>
                              {isExpanded && (
                                <div className="grid md:grid-cols-2 gap-3 mb-3">
                                  {inSeason.map(act => {
                                    const key  = `${propId}:${act.id}`;
                                    const qty  = activityQty[key] || 0;
                                    const Icon = ICON_MAP[act.iconName] ?? Fish;
                                    return (
                                      <div key={key} className="p-3 rounded-2xl flex items-center gap-3 transition-all" style={{ background: qty > 0 ? C.seafoam : 'white', border: `1.5px solid ${qty > 0 ? C.ltTeal : C.border}` }}>
                                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-colors" style={{ background: qty > 0 ? C.navy : C.sand }} aria-hidden="true">
                                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: qty > 0 ? 'white' : C.navy }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-sm" style={{ color: C.navy }}>{act.name}</div>
                                          <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: C.textLight }}>
                                            <span>${act.prices?.[islandId] ?? act.defaultPrice ?? act.price} pp</span><span aria-hidden="true">·</span><span>{act.duration}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {qty > 0 && (
                                            <>
                                              <button onClick={() => updateActivity(propId, act.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(12,52,65,0.08)', color: C.navy }} aria-label={`Remove ${act.name}`}>
                                                <Minus className="w-3 h-3" aria-hidden="true" />
                                              </button>
                                              <span className="font-display text-base w-5 text-center" style={{ color: C.navy }}>{qty}</span>
                                            </>
                                          )}
                                          <button onClick={() => updateActivity(propId, act.id, 1)} disabled={qty >= n} className="w-7 h-7 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity" style={{ background: qty >= n ? C.textLight : C.navy }} aria-label={qty >= n ? `Max ${n} activities` : `Add ${act.name}`} title={qty >= n ? `Max ${n} activities (1 per night)` : undefined}>
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
                                          const Icon = ICON_MAP[act.iconName] ?? Fish;
                                          return (
                                            <div key={`${propId}:${act.id}`} className="p-4 rounded-2xl flex items-center gap-4 opacity-45" style={{ background: 'white', border: `1px dashed ${C.border}` }}>
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
                              )}

                              {/* Collapsed state */}
                              {!isExpanded && (() => {
                                const selected = inSeason.filter(a => (activityQty[`${propId}:${a.id}`] || 0) > 0);
                                return (
                                  <>
                                    {selected.length > 0 && (
                                      <div className="mb-2 space-y-1.5">
                                        {selected.map(act => {
                                          const Icon  = ICON_MAP[act.iconName] ?? Fish;
                                          const qty   = activityQty[`${propId}:${act.id}`];
                                          const price = act.prices?.[islandId] ?? act.defaultPrice ?? act.price;
                                          return (
                                            <div key={act.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                              style={{ background: C.seafoam, border: `1px solid ${C.ltTeal}` }}>
                                              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: C.navy }}>
                                                <Icon className="w-3.5 h-3.5" style={{ color: 'white' }} />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold leading-tight" style={{ color: C.navy }}>{act.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: C.textLight }}>
                                                  <span>${price} pp</span>
                                                  <span>·</span>
                                                  <span>{act.duration}</span>
                                                </div>
                                              </div>
                                              {qty > 1 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                                                  style={{ background: C.teal, color: 'white' }}>×{qty}</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    <button
                                      onClick={expand}
                                      className="mt-1 w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl border-2 border-dashed text-sm font-semibold transition-all hover:border-solid hover:shadow-md group"
                                      style={{ borderColor: C.coral, color: C.coral, background: 'transparent' }}>
                                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors group-hover:bg-orange-50"
                                        style={{ borderColor: C.coral }}>
                                        <Plus className="w-3.5 h-3.5" />
                                      </div>
                                      {selected.length > 0 ? 'Edit experiences' : 'Add an experience'}
                                    </button>
                                  </>
                                );
                              })()}

                              {/* Collapse button */}
                              {isExpanded && (
                                <button
                                  onClick={collapse}
                                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold transition-all hover:opacity-70"
                                  style={{ color: C.textLight, background: 'rgba(12,52,65,0.04)' }}>
                                  <ArrowLeft className="w-3 h-3 rotate-90" />
                                  Collapse
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>

                {/* Share my trip */}
                <div className="mt-8 rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a5468 100%)` }}>
                  <div className="p-5 sm:p-7">
                    <div className="text-3xl mb-3" aria-hidden="true">🌊</div>
                    <div className="text-[10px] tracking-[0.25em] uppercase font-bold mb-1 text-white/50">{t('s5.shareTitle')}</div>
                    <h3 className="font-display text-xl sm:text-2xl text-white leading-tight mb-1">
                      {nights} {t('s5.nights')} · {pkg?.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-1">{monthLabel} · {islandNames}</p>
                    <p className="font-display text-3xl text-white mb-5">${totalWithGst.toLocaleString()}<span className="text-sm font-sans text-white/50 ml-1">{t('s5.inclGST')}</span></p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={shareMyTrip}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <Share2 className="w-4 h-4" aria-hidden="true" /> {t('s5.shareBtn')}
                      </button>
                      <button
                        onClick={() => setShowModal(true)}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{ background: C.coral, color: 'white' }}
                      >
                        {t('s5.makeItHappen')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* NAV BUTTONS */}
            {step > 1 && <div className="hidden lg:flex flex-col items-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: C.border }}>
              <div className="flex justify-between items-center w-full">
                <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}
                  className="flex items-center gap-2 text-sm disabled:opacity-30 transition-opacity font-medium"
                  style={{ color: C.navy }} aria-label="Previous step">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('bar.back')}
                </button>

                {step < 5 ? (
                  <button onClick={() => canAdvance() && setStep(s => Math.min(5, s+1))} disabled={!canAdvance()}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: C.navy }} aria-describedby={stepError ? 'step-error' : undefined}>
                    {t('bar.keepGoing')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                    {t('bar.makeItHappen')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {stepError && (
                <p id="step-error" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: C.coral }} role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {stepError}
                </p>
              )}
            </div>}

          </div>
        </main>

        {/* ===== SIDEBAR ===== */}
        <aside className="hidden lg:block lg:sticky lg:top-20 h-fit" aria-label="Trip summary">
          <div className="rounded-3xl p-6 border" style={{ background: 'white', borderColor: C.border, boxShadow: '0 4px 24px rgba(12,52,65,0.07)' }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-4 font-bold" style={{ color: C.coral }}>{t('sidebar.title')}</div>

            {!pkg ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-3">🌊</div>
                <p className="text-sm" style={{ color: C.textLight }}>{t('sidebar.empty')}</p>
              </div>
            ) : (
              <>
                <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                  <div className="font-display text-xl" style={{ color: C.navy }}>{t(`pkg.${pkg.id}_name`)}</div>
                  <div className="text-sm mt-1" style={{ color: C.textLight }}>
                    {monthLabel && <>{monthLabel} · </>}{nights} {t('s5.nights')} · {guests} {guests === 1 ? t('s2.travelers') : t('s2.travelers')}
                  </div>
                </div>

                {selectedProperties.length > 0 && (
                  <div className="pb-4 mb-4 border-b" style={{ borderColor: C.borderFaint }}>
                    <div className="text-xs tracking-[0.2em] uppercase mb-2 font-semibold" style={{ color: C.textLight }}>{t('sidebar.itinerary')}</div>
                    <div className="space-y-2">
                      {selectedProperties.map(id => {
                        const prop      = propertyById[id];
                        const propIslandName = prop?.islandName ?? islandById[prop?.islandId]?.name;
                        const n         = nightsPerIsland[id] || 0;
                        const acts      = summaryByIsland[id] || [];
                        return (
                          <div key={id}>
                            <div className="flex items-start justify-between text-sm gap-2" style={{ color: C.navy }}>
                              <span className="flex items-start gap-2">
                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.coral }} aria-hidden="true" />
                                <span>
                                  <span className="font-semibold">{prop?.name}</span>
                                  <span className="block text-xs font-normal" style={{ color: C.textLight }}>{propIslandName}</span>
                                </span>
                              </span>
                              <span className="text-xs shrink-0" style={{ color: C.textLight }}>{n}n</span>
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
                  <div className="flex justify-between"><span>{t('sidebar.stay')}</span><span>${stayCost.toLocaleString()}</span></div>
                  {transferCost > 0 && <div className="flex justify-between"><span>{t('sidebar.transfers')}</span><span>${transferCost.toLocaleString()}</span></div>}
                  {activitiesCost > 0 && <div className="flex justify-between"><span>{t('sidebar.experiences')}</span><span>${activitiesCost.toLocaleString()}</span></div>}
                  <div className="flex justify-between pt-1.5 border-t text-xs" style={{ borderColor: C.borderFaint, color: C.textLight }}>
                    <span>{t('sidebar.gst')}</span><span>+${gst.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: C.textLight }}>{t('sidebar.total')}</span>
                  <span className="font-display text-3xl" style={{ color: C.navy }}>${totalWithGst.toLocaleString()}</span>
                </div>

                <div className="text-xs leading-relaxed mb-4" style={{ color: C.textLight }}>
                  {t('sidebar.disclaimer')}
                </div>

                {step === 5 && (
                  <button onClick={() => setShowModal(true)}
                    className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}>
                    {t('sidebar.makeItHappen')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ===== MOBILE STICKY BOTTOM BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t" style={{ background: 'rgba(255,249,240,0.97)', borderColor: C.border, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        {/* Price strip */}
        {pkg && (
          <div className="px-5 pt-2.5 pb-1 flex items-baseline justify-between" style={{ borderBottom: `1px solid ${C.borderFaint}` }}>
            <span className="text-[11px] font-medium tracking-wide" style={{ color: C.textLight }}>{t('bar.estTotal')}</span>
            <span className="font-display text-xl" style={{ color: C.navy }}>${totalWithGst.toLocaleString()}</span>
          </div>
        )}
        {/* Nav row */}
        <div className="px-4 py-3 pb-safe flex items-center gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-3 rounded-full border shrink-0 active:scale-95 transition-transform"
              style={{ borderColor: C.border, color: C.navy, background: 'white' }}
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('bar.back')}
            </button>
          ) : <div className="shrink-0 w-2" />}

          {step < 5 ? (
            <button
              onClick={() => canAdvance() && setStep(s => Math.min(5, s + 1))}
              disabled={!canAdvance()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-sm font-semibold disabled:opacity-40 active:scale-95 transition-transform"
              style={{ background: C.navy }}
              aria-describedby={stepError ? 'step-error-mobile' : undefined}
            >
              {t('bar.keepGoing')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-sm font-semibold active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${C.coral} 0%, ${C.copper} 100%)` }}
            >
              {t('bar.makeItHappen')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {stepError && (
          <p id="step-error-mobile" className="px-5 pb-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: C.coral }} role="alert">
            <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {stepError}
          </p>
        )}
      </div>

      </>}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <BookingModal isOpen={showModal} onClose={() => setShowModal(false)} summary={bookingSummary} tripData={bookingTripData} />

      {/* Footer */}
      <div className="text-center pt-4 pb-32 lg:pb-6 text-xs" style={{ color: C.textLight, borderTop: `1px solid ${C.border}` }}>
        © {new Date().getFullYear()} Wave Voyages · Malé, Maldives ·{' '}
        <button onClick={() => setCurrentPage('admin')} className="hover:underline" style={{ color: C.textLight }}>Admin</button>
      </div>
    </div>
  );
}
