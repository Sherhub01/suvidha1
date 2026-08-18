import {
  Zap, Wrench, Hammer, Flame, PaintBucket, Sparkles,
  Snowflake, Car, Bug, Truck, Camera, Droplets,
  GraduationCap, Scissors, Box, HardHat,
} from "lucide-react";

// Service catalogue shown on the consumer dashboard, services grid and the
// worker listings. Prices are "starting from" figures used for display only —
// the booking price comes from the professional's own profile.

export const SERVICES = [
  {
    slug: "electrician",    name: "Electrician",       icon: Zap,
    description: "Wiring, switchboards, fan & light fittings, fault repair.",
    startingPrice: 199, priceType: "hourly",
    bg: "https://images.unsplash.com/photo-1758101755915-462eddc23f57?w=600&auto=format&fit=crop&q=60",
    accent: "from-yellow-500/80 to-orange-600/80",
  },
  {
    slug: "plumber",        name: "Plumber",            icon: Wrench,
    description: "Leak fixes, tap & pipe work, bathroom fittings.",
    startingPrice: 179, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1664298589198-b15ff5382648?w=600&auto=format&fit=crop&q=60",
    accent: "from-blue-600/80 to-cyan-700/80",
  },
  {
    slug: "carpenter",      name: "Carpenter",          icon: Hammer,
    description: "Furniture repair, modular work, door & window fixes.",
    startingPrice: 249, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682145637222-1556eda23db6?w=600&auto=format&fit=crop&q=60",
    accent: "from-amber-700/80 to-yellow-800/80",
  },
  {
    slug: "welder",         name: "Welder",             icon: Flame,
    description: "Grills, gates, railings — fabrication & repair.",
    startingPrice: 299, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682141563888-e64fd5b66e4d?w=600&auto=format&fit=crop&q=60",
    accent: "from-orange-600/80 to-red-700/80",
  },
  {
    slug: "painter",        name: "Painter",            icon: PaintBucket,
    description: "Interior & exterior painting, texture finishes.",
    startingPrice: 15, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1692148496675-210ef7d19c72?w=600&auto=format&fit=crop&q=60",
    accent: "from-pink-500/80 to-rose-600/80",
  },
  {
    slug: "cleaning",       name: "Cleaning Staff",     icon: Sparkles,
    description: "Home deep cleaning, kitchen & bathroom sanitising.",
    startingPrice: 149, priceType: "hourly",
    bg: "https://plus.unsplash.com/premium_photo-1683141112334-d7d404f6e716?w=600&auto=format&fit=crop&q=60",
    accent: "from-teal-500/80 to-emerald-600/80",
  },
  {
    slug: "ac-repair",      name: "AC Repair",          icon: Snowflake,
    description: "Servicing, gas refill, installation & repair.",
    startingPrice: 299, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1683134512538-7b390d0adc9e?w=600&auto=format&fit=crop&q=60",
    accent: "from-sky-500/80 to-blue-700/80",
  },
  {
    slug: "mechanic",       name: "Mechanic",           icon: Car,
    description: "Two & four wheeler doorstep repair and servicing.",
    startingPrice: 199, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1677009541474-1fc2642943c1?w=600&auto=format&fit=crop&q=60",
    accent: "from-slate-600/80 to-gray-800/80",
  },
  {
    slug: "pest-control",   name: "Pest Control",       icon: Bug,
    description: "Cockroach, termite & mosquito treatments.",
    startingPrice: 399, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1682126104327-ef7d5f260cf7?w=600&auto=format&fit=crop&q=60",
    accent: "from-lime-600/80 to-green-800/80",
  },
  {
    slug: "movers",         name: "Movers & Packers",   icon: Truck,
    description: "Local & intercity shifting with safe packing.",
    startingPrice: 999, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1663045627496-441affafddf1?w=600&auto=format&fit=crop&q=60",
    accent: "from-indigo-600/80 to-violet-700/80",
  },
  {
    slug: "cctv",           name: "CCTV Installer",     icon: Camera,
    description: "Camera setup, wiring, DVR configuration.",
    startingPrice: 499, priceType: "fixed",
    bg: "https://images.unsplash.com/photo-1530151928300-3864d0e5d178?w=600&auto=format&fit=crop&q=60",
    accent: "from-gray-700/80 to-slate-900/80",
  },
  {
    slug: "ro-technician",  name: "RO Technician",      icon: Droplets,
    description: "Water purifier service, filter change, repair.",
    startingPrice: 149, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1667238586553-e4ddb2b0cdbb?w=600&auto=format&fit=crop&q=60",
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
    bg: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=60",
    accent: "from-fuchsia-500/80 to-pink-700/80",
  },
  {
    slug: "appliance-repair", name: "Appliance Repair", icon: Box,
    description: "Washing machine, fridge, microwave & more.",
    startingPrice: 199, priceType: "fixed",
    bg: "https://plus.unsplash.com/premium_photo-1661342490985-26da70d07a52?w=600&auto=format&fit=crop&q=60",
    accent: "from-blue-500/80 to-indigo-700/80",
  },
  {
    slug: "mason",          name: "Mason",              icon: HardHat,
    description: "Brickwork, plastering, tile fixing & civil repairs.",
    startingPrice: 399, priceType: "fixed",
    bg: "https://images.unsplash.com/photo-1489514354504-1653aa90e34e?w=600&auto=format&fit=crop&q=60",
    accent: "from-stone-500/80 to-amber-800/80",
  },
];

export const getCategoryBySlug = (slug) => SERVICES.find((s) => s.slug === slug) || null;

