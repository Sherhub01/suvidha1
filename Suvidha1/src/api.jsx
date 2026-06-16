import axios from "axios";
import {
  Zap, Wrench, Hammer, Flame, PaintBucket, Sparkles,
  Snowflake, Car, Bug, Truck, Camera, Droplets,
  GraduationCap, Scissors, Box, HardHat,
} from "lucide-react";

// ─── Axios instance (default export) ────────────────────────────────────────
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

// ─── Tailwind design tokens ──────────────────────────────────────────────────
export const THEME = {
  heroBg:      "bg-[linear-gradient(135deg,#312E81_0%,#4F46E5_30%,#7C3AED_60%,#06B6D4_100%)]",
  card:        "rounded-2xl border border-gray-100 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
  cardHover:   "rounded-2xl border border-gray-100 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]",
  glassCard:   "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md",
  glassChip:   "rounded-full border border-white/20 bg-white/10 backdrop-blur-md",
  input:       "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100",
  primaryBtn:  "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-60",
  secondaryBtn:"inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 active:scale-95 disabled:opacity-60",
  outlineBtn:  "inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 active:scale-95",
  ratingBadge: "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700",
  locationTag: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600",
  priceTag:    "inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
  errorAlert:  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600",
  successAlert:"rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700",
};

// ─── Service categories ──────────────────────────────────────────────────────
export const SERVICES = [
  {
    slug: "electrician",    name: "Electrician",       icon: Zap,
    description: "Wiring, switchboards, fan & light fittings, fault repair.",
    startingPrice: 199, priceType: "hourly",
    bg: "https://images.unsplash.com/photo-1758101755915-462eddc23f57?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZWxjdHJpY2lhbnxlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-yellow-500/80 to-orange-600/80",
  },
  {
    slug: "plumber",        name: "Plumber",            icon: Wrench,
    description: "Leak fixes, tap & pipe work, bathroom fittings.",
    startingPrice: 179, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1664298589198-b15ff5382648?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGx1bWJlcnxlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-blue-600/80 to-cyan-700/80",
  },
  {
    slug: "carpenter",      name: "Carpenter",          icon: Hammer,
    description: "Furniture repair, modular work, door & window fixes.",
    startingPrice: 249, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682145637222-1556eda23db6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2FycGVudGVyfGVufDB8fDB8fHww",
    accent: "from-amber-700/80 to-yellow-800/80",
  },
  {
    slug: "welder",         name: "Welder",             icon: Flame,
    description: "Grills, gates, railings — fabrication & repair.",
    startingPrice: 299, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682141563888-e64fd5b66e4d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHdlbGRlcnxlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-orange-600/80 to-red-700/80",
  },
  {
    slug: "painter",        name: "Painter",            icon: PaintBucket,
    description: "Interior & exterior painting, texture finishes.",
    startingPrice: 15, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1692148496675-210ef7d19c72?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI0fHx8ZW58MHx8fHx8",
    accent: "from-pink-500/80 to-rose-600/80",
  },
  {
    slug: "cleaning",       name: "Cleaning Staff",     icon: Sparkles,
    description: "Home deep cleaning, kitchen & bathroom sanitising.",
    startingPrice: 149, priceType: "hourly",
    bg: "https://plus.unsplash.com/premium_photo-1683141112334-d7d404f6e716?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2xlYW5pbmclMjBzdGFmZnxlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-teal-500/80 to-emerald-600/80",
  },
  {
    slug: "ac-repair",      name: "AC Repair",          icon: Snowflake,
    description: "Servicing, gas refill, installation & repair.",
    startingPrice: 299, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1683134512538-7b390d0adc9e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWMlMjByZXBhaXJ8ZW58MHx8MHx8fDA%3D",
    accent: "from-sky-500/80 to-blue-700/80",
  },
  {
    slug: "mechanic",       name: "Mechanic",           icon: Car,
    description: "Two & four wheeler doorstep repair and servicing.",
    startingPrice: 199, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1677009541474-1fc2642943c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVjaGFuaWN8ZW58MHx8MHx8fDA%3D",
    accent: "from-slate-600/80 to-gray-800/80",
  },
  {
    slug: "pest-control",   name: "Pest Control",       icon: Bug,
    description: "Cockroach, termite & mosquito treatments.",
    startingPrice: 399, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682126104327-ef7d5f260cf7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVzdCUyMGNvbnRyb2x8ZW58MHx8MHx8fDA%3D",
    accent: "from-lime-600/80 to-green-800/80",
  },
  {
    slug: "movers",         name: "Movers & Packers",   icon: Truck,
    description: "Local & intercity shifting with safe packing.",
    startingPrice: 999, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1663045627496-441affafddf1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG1vdmVyc3xlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-indigo-600/80 to-violet-700/80",
  },
  {
    slug: "cctv",           name: "CCTV Installer",     icon: Camera,
    description: "Camera setup, wiring, DVR configuration.",
    startingPrice: 499, priceType: "fixed",
    bg: "https://images.unsplash.com/photo-1530151928300-3864d0e5d178?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNjdHZ8ZW58MHx8MHx8fDA%3D",
    accent: "from-gray-700/80 to-slate-900/80",
  },
  {
    slug: "ro-technician",  name: "RO Technician",      icon: Droplets,
    description: "Water purifier service, filter change, repair.",
    startingPrice: 149, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1667238586553-e4ddb2b0cdbb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cm8lMjB0ZWNobml0aWFufGVufDB8fDB8fHww",
    accent: "from-cyan-500/80 to-blue-600/80",
  },
  {
    slug: "home-tutor",     name: "Home Tutor",         icon: GraduationCap,
    description: "Subject experts for school & college students.",
    startingPrice: 299, priceType: "hourly",
    bg: "https://media.istockphoto.com/id/1033164844/photo/mother-helping-teenager-with-homework.webp?a=1&b=1&s=612x612&w=0&k=20&c=qUetlv-f6URF72avWfYFW7w53bXzqC6Ln1pz4dI--8w=",
    accent: "from-violet-500/80 to-purple-700/80",
  },
  {
    slug: "beautician",     name: "Beautician",         icon: Scissors,
    description: "At-home salon, grooming & spa services.",
    startingPrice: 249, priceType: "fixed",
    bg: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVhdXRpY2lhbnxlbnwwfHwwfHx8MA%3D%3D",
    accent: "from-fuchsia-500/80 to-pink-700/80",
  },
  {
    slug: "appliance-repair", name: "Appliance Repair", icon: Box,
    description: "Washing machine, fridge, microwave & more.",
    startingPrice: 199, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1661342490985-26da70d07a52?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXBwbGlhbmNlJTIwcmVwYWlyfGVufDB8fDB8fHww",
    accent: "from-blue-500/80 to-indigo-700/80",
  },
  {
    slug: "mason",          name: "Mason",              icon: HardHat,
    description: "Brickwork, plastering, tile fixing & civil repairs.",
    startingPrice: 399, priceType: "fixed",
    bg: "https://images.unsplash.com/photo-1489514354504-1653aa90e34e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFzb258ZW58MHx8MHx8fDA%3D",
    accent: "from-stone-500/80 to-amber-800/80",
  },
];

export const getCategoryBySlug = (slug) => SERVICES.find((s) => s.slug === slug) || null;

// ─── Mock user ───────────────────────────────────────────────────────────────
export const MOCK_USER = {
  id:           "u1",
  firstName:    "Rahul",
  lastName:     "Sharma",
  username:     "rahul_s",
  email:        "rahul.sharma@example.com",
  phone:        "+91 98765 43210",
  profilePhoto: "https://plus.unsplash.com/premium_photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  gender:       "male",
  dob:          "1995-04-15",
  aadhaarNumber:"",
  city:         "New Delhi",
  state:        "Delhi",
  pinCode:      "110001",
  fullAddress:  "42, MG Road, Connaught Place, New Delhi",
  address: {
    city: "New Delhi", state: "Delhi", pinCode: "110001",
    fullAddress: "42, MG Road, Connaught Place, New Delhi",
  },
  location: { type: "Point", coordinates: [77.2090, 28.6139] },
};

// ─── Mock workers ────────────────────────────────────────────────────────────
export const MOCK_WORKERS = [
  {
    id:"w1", name:"Ramesh Yadav",    category:"electrician",  city:"New Delhi",
    profilePhoto:"https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?q=80&w=300&auto=format&fit=crop",
    rating:4.8, reviewsCount:212, experience:8, price:199, priceType:"hourly",
    availability:"available_now", distance:"1.2 km", phone:"+91 98100 11111",
    address:"Lajpat Nagar, New Delhi", skills:["Wiring","Switchboards","Fan fitting","Fault repair"],
    certificates:["ISI Certified Electrician"], portfolio:[],
    location:{ type:"Point", coordinates:[77.2351, 28.5672] },
  },
  {
    id:"w2", name:"Sunita Devi",     category:"cleaning",     city:"Gurugram",
    profilePhoto:"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop",
    rating:4.9, reviewsCount:348, experience:5, price:149, priceType:"hourly",
    availability:"available_now", distance:"0.8 km", phone:"+91 98100 22222",
    address:"DLF Phase 2, Gurugram", skills:["Deep cleaning","Kitchen cleaning","Bathroom sanitising"],
    certificates:[], portfolio:[],
    location:{ type:"Point", coordinates:[77.0917, 28.4595] },
  },
  {
    id:"w3", name:"Mohd. Aslam",     category:"plumber",      city:"Noida",
    profilePhoto:"https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=300&auto=format&fit=crop",
    rating:4.7, reviewsCount:176, experience:10, price:179, priceType:"fixed",
    availability:"today", distance:"2.4 km", phone:"+91 98100 33333",
    address:"Sector 18, Noida", skills:["Leak repair","Tap fitting","Pipe work","Bathroom fittings"],
    certificates:["Licensed Plumber"], portfolio:[],
    location:{ type:"Point", coordinates:[77.3910, 28.5700] },
  },
  {
    id:"w4", name:"Vikram Singh",    category:"carpenter",    city:"New Delhi",
    profilePhoto:"https://images.unsplash.com/photo-1612392061787-2d078b3e573e?q=80&w=300&auto=format&fit=crop",
    rating:4.6, reviewsCount:98, experience:6, price:249, priceType:"fixed",
    availability:"this_week", distance:"3.1 km", phone:"+91 98100 44444",
    address:"Saket, New Delhi", skills:["Furniture repair","Modular work","Door & window fixes"],
    certificates:[], portfolio:[],
    location:{ type:"Point", coordinates:[77.2167, 28.5245] },
  },
  {
    id:"w5", name:"Pooja Sharma",    category:"beautician",   city:"Gurugram",
    profilePhoto:"https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=300&auto=format&fit=crop",
    rating:4.9, reviewsCount:256, experience:4, price:249, priceType:"fixed",
    availability:"available_now", distance:"1.6 km", phone:"+91 98100 55555",
    address:"Sushant Lok, Gurugram", skills:["Facial","Threading","Waxing","Bridal makeup"],
    certificates:["VLCC Certified"], portfolio:[],
    location:{ type:"Point", coordinates:[77.0633, 28.4702] },
  },
  {
    id:"w6", name:"Deepak Kumar",    category:"ac-repair",    city:"Noida",
    profilePhoto:"https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300&auto=format&fit=crop",
    rating:4.5, reviewsCount:134, experience:7, price:299, priceType:"fixed",
    availability:"today", distance:"2.0 km", phone:"+91 98100 66666",
    address:"Sector 62, Noida", skills:["AC servicing","Gas refill","Installation","Repair"],
    certificates:["Daikin Authorised Technician"], portfolio:[],
    location:{ type:"Point", coordinates:[77.3720, 28.6257] },
  },
  {
    id:"w7", name:"Arjun Mehta",     category:"mechanic",     city:"New Delhi",
    profilePhoto:"https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=200&auto=format&fit=crop",
    rating:4.6, reviewsCount:89, experience:9, price:199, priceType:"fixed",
    availability:"available_now", distance:"0.4 km", phone:"+91 98100 77777",
    address:"Karol Bagh, New Delhi", skills:["Two-wheeler repair","Four-wheeler repair","Oil change"],
    certificates:[], portfolio:[],
    location:{ type:"Point", coordinates:[77.1900, 28.6505] },
  },
  {
    id:"w8", name:"Kiran Bose",      category:"ro-technician",city:"Gurugram",
    profilePhoto:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
    rating:4.7, reviewsCount:61, experience:5, price:149, priceType:"fixed",
    availability:"available_now", distance:"0.9 km", phone:"+91 98100 88888",
    address:"Sector 49, Gurugram", skills:["Filter change","Membrane replacement","UV lamp repair"],
    certificates:["Kent Authorised"], portfolio:[],
    location:{ type:"Point", coordinates:[77.0429, 28.4200] },
  },
];

// ─── Mock notifications ──────────────────────────────────────────────────────
export const fetchNotifications = async () => [
  { id:"n1", type:"success", title:"Booking confirmed",   body:"Ramesh Yadav will arrive tomorrow at 10 AM.", time:"2m ago" },
  { id:"n2", type:"info",    title:"New professional nearby", body:"3 electricians just joined in your area.",   time:"1h ago" },
  { id:"n3", type:"warning", title:"Profile incomplete",  body:"Add your address to get better matches.",       time:"3h ago" },
];

// ─── Async helpers (mock — replace with real API calls) ──────────────────────
export const fetchWorkers = async ({ category, search = "", city = "", minRating = "", minExperience = "", sort = "rating" } = {}) => {
  await new Promise((r) => setTimeout(r, 400));
  let list = [...MOCK_WORKERS];
  if (category && category !== "all") list = list.filter((w) => w.category === category);
  if (search)      list = list.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.category.includes(search.toLowerCase()));
  if (city)        list = list.filter((w) => w.city === city);
  if (minRating)   list = list.filter((w) => w.rating >= parseFloat(minRating));
  if (minExperience) list = list.filter((w) => w.experience >= parseInt(minExperience));
  if (sort === "rating")      list.sort((a, b) => b.rating - a.rating);
  if (sort === "price_asc")   list.sort((a, b) => a.price - b.price);
  if (sort === "price_desc")  list.sort((a, b) => b.price - a.price);
  if (sort === "experience")  list.sort((a, b) => b.experience - a.experience);
  return list;
};

export const fetchWorkerProfile = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK_WORKERS.find((w) => w.id === id) || null;
};

export const fetchServiceDetails = async (slug) => {
  await new Promise((r) => setTimeout(r, 300));
  return { workers: MOCK_WORKERS.filter((w) => w.category === slug) };
};

export const updateProfile   = async (data) => { await new Promise((r) => setTimeout(r, 500)); return data; };
export const changePassword  = async (data) => { await new Promise((r) => setTimeout(r, 500)); return data; };
export const updateLocation  = async (data) => { await new Promise((r) => setTimeout(r, 500)); return data; };
export const createBooking   = async (data) => { await new Promise((r) => setTimeout(r, 600)); return { id: "b_" + Date.now(), ...data }; };

export const fetchRecentBookings = async () => {
  await new Promise((r) => setTimeout(r, 400));
  return [
    { id:"b1", category:"electrician", worker:MOCK_WORKERS[0], date:"2026-06-12", price:199, status:"completed" },
    { id:"b2", category:"ac-repair",   worker:MOCK_WORKERS[5], date:"2026-06-08", price:299, status:"completed" },
    { id:"b3", category:"plumber",     worker:MOCK_WORKERS[2], date:"2026-06-14", price:179, status:"pending"   },
  ];
};

export const fetchNearbyWorkers = async () => {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_WORKERS.slice(0, 4);
};
