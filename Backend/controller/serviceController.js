import Service from "../models/service.js";
import StaffProfile from "../models/staffProfile.js";
import Booking from "../models/booking.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ────────────────────────────────────────────────────────────
// Seed data
//
// Matches the catalogue the frontend previously hardcoded, now with the
// commission, tax and duration fields the pricing engine needs.
// `basePrice` and `visitFee` are in rupees.
// ────────────────────────────────────────────────────────────

const SEED_SERVICES = [
  { slug: "electrician", name: "Electrician", category: "Electrical", icon: "⚡", basePrice: 199, priceType: "hourly", visitFee: 49, minPrice: 149, maxPrice: 2000, defaultDurationMins: 60, description: "Wiring, switchboards, fan & light fittings, fault repair." },
  { slug: "plumber", name: "Plumber", category: "Plumbing", icon: "🔧", basePrice: 179, priceType: "fixed", visitFee: 49, minPrice: 149, maxPrice: 3000, defaultDurationMins: 60, description: "Leak fixes, tap & pipe work, bathroom fittings." },
  { slug: "carpenter", name: "Carpenter", category: "Carpentry", icon: "🪵", basePrice: 249, priceType: "fixed", visitFee: 49, minPrice: 199, maxPrice: 5000, defaultDurationMins: 90, description: "Furniture repair, modular work, door & window fixes." },
  { slug: "welder", name: "Welder", category: "Fabrication", icon: "🔥", basePrice: 299, priceType: "fixed", visitFee: 99, minPrice: 249, maxPrice: 6000, defaultDurationMins: 120, description: "Grills, gates, railings — fabrication & repair." },
  { slug: "painter", name: "Painter", category: "Painting", icon: "🎨", basePrice: 15, priceType: "fixed", visitFee: 99, minPrice: 10, maxPrice: 500, defaultDurationMins: 240, description: "Interior & exterior painting, texture finishes." },
  { slug: "cleaning", name: "Cleaning Staff", category: "Cleaning", icon: "🧹", basePrice: 149, priceType: "hourly", visitFee: 0, minPrice: 99, maxPrice: 1000, defaultDurationMins: 120, description: "Home deep cleaning, kitchen & bathroom sanitising." },
  { slug: "ac-repair", name: "AC Repair", category: "HVAC", icon: "❄️", basePrice: 299, priceType: "fixed", visitFee: 99, minPrice: 249, maxPrice: 5000, defaultDurationMins: 90, description: "Servicing, gas refill, installation & repair." },
  { slug: "mechanic", name: "Mechanic", category: "Automotive", icon: "🔩", basePrice: 199, priceType: "fixed", visitFee: 99, minPrice: 149, maxPrice: 5000, defaultDurationMins: 90, description: "Two & four wheeler doorstep repair and servicing." },
  { slug: "mason", name: "Mason", category: "Civil", icon: "🧱", basePrice: 399, priceType: "fixed", visitFee: 99, minPrice: 299, maxPrice: 10000, defaultDurationMins: 240, description: "Brickwork, plastering, tile fixing & civil repairs." },
  { slug: "cctv", name: "CCTV Installer", category: "Security", icon: "📹", basePrice: 499, priceType: "fixed", visitFee: 99, minPrice: 399, maxPrice: 10000, defaultDurationMins: 180, description: "Camera setup, wiring, DVR configuration." },
  { slug: "ro-technician", name: "RO Technician", category: "Appliances", icon: "💧", basePrice: 149, priceType: "fixed", visitFee: 49, minPrice: 99, maxPrice: 3000, defaultDurationMins: 60, description: "Water purifier service, filter change, repair." },
  { slug: "appliance-repair", name: "Appliance Repair", category: "Appliances", icon: "📦", basePrice: 199, priceType: "fixed", visitFee: 99, minPrice: 149, maxPrice: 5000, defaultDurationMins: 90, description: "Washing machine, fridge, microwave & more." },
  { slug: "pest-control", name: "Pest Control", category: "Pest", icon: "🐛", basePrice: 399, priceType: "fixed", visitFee: 0, minPrice: 299, maxPrice: 5000, defaultDurationMins: 120, description: "Cockroach, termite & mosquito treatments." },
  { slug: "movers", name: "Movers & Packers", category: "Logistics", icon: "🚚", basePrice: 999, priceType: "fixed", visitFee: 0, minPrice: 799, maxPrice: 50000, defaultDurationMins: 360, description: "Local & intercity shifting with safe packing." },
  { slug: "home-tutor", name: "Home Tutor", category: "Education", icon: "🎓", basePrice: 299, priceType: "hourly", visitFee: 0, minPrice: 199, maxPrice: 2000, defaultDurationMins: 60, taxPercent: 0, description: "Subject experts for school & college students." },
  { slug: "beautician", name: "Beautician", category: "Personal Care", icon: "✂️", basePrice: 249, priceType: "fixed", visitFee: 49, minPrice: 199, maxPrice: 5000, defaultDurationMins: 90, description: "At-home salon, grooming & spa services." },
];

/** Inserts any catalogue entry that is missing. Existing rows are left alone. */
export const seedServices = async () => {
  const existing = await Service.countDocuments();
  if (existing > 0) return;

  await Service.insertMany(
    SEED_SERVICES.map((s, i) => ({ ...s, sortOrder: i, isActive: true }))
  );
  console.log(`Seeded ${SEED_SERVICES.length} services`);
};

// ────────────────────────────────────────────────────────────
// Public catalogue
// ────────────────────────────────────────────────────────────

export const listServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select("-commissionPercent -minPrice -maxPrice")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({ success: true, services });
  } catch (err) {
    console.error("listServices error:", err);
    fail(res, 500, "Server error");
  }
};

export const getService = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true })
      .select("-commissionPercent -minPrice -maxPrice")
      .lean();

    if (!service) return fail(res, 404, "Service not found");

    const professionals = await StaffProfile.countDocuments({
      status: "approved",
      category: service.category,
    });

    res.json({ success: true, service, professionals });
  } catch (err) {
    console.error("getService error:", err);
    fail(res, 500, "Server error");
  }
};

// ────────────────────────────────────────────────────────────
// Admin CRUD
// ────────────────────────────────────────────────────────────

export const adminListServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ sortOrder: 1, name: 1 }).lean();

    // Booking counts per service, so the admin can see what is actually used.
    const counts = await Booking.aggregate([
      { $group: { _id: "$serviceRef", bookings: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.bookings]));

    res.json({
      success: true,
      services: services.map((s) => ({ ...s, bookings: countMap[String(s._id)] || 0 })),
    });
  } catch (err) {
    console.error("adminListServices error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminCreateService = async (req, res) => {
  try {
    if (req.body.minPrice > req.body.maxPrice) {
      return fail(res, 400, "The minimum price cannot exceed the maximum price.");
    }

    const exists = await Service.findOne({ slug: req.body.slug });
    if (exists) return fail(res, 409, "A service with that slug already exists.");

    const service = await Service.create(req.body);
    res.status(201).json({ success: true, service });
  } catch (err) {
    console.error("adminCreateService error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminUpdateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return fail(res, 404, "Service not found");

    Object.assign(service, req.body);

    if (service.minPrice > service.maxPrice) {
      return fail(res, 400, "The minimum price cannot exceed the maximum price.");
    }

    await service.save();
    res.json({ success: true, service });
  } catch (err) {
    console.error("adminUpdateService error:", err);
    fail(res, 500, "Server error");
  }
};

/**
 * Services are deactivated rather than deleted — existing bookings reference
 * them, and their historical pricing must stay resolvable.
 */
export const adminToggleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return fail(res, 404, "Service not found");

    service.isActive = !service.isActive;
    await service.save();

    res.json({
      success: true,
      service,
      message: service.isActive
        ? `${service.name} is live again.`
        : `${service.name} is hidden from customers. Existing bookings are unaffected.`,
    });
  } catch (err) {
    console.error("adminToggleService error:", err);
    fail(res, 500, "Server error");
  }
};

export const adminDeleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return fail(res, 404, "Service not found");

    const bookings = await Booking.countDocuments({ serviceRef: service._id });
    if (bookings > 0) {
      return fail(
        res,
        409,
        `${service.name} has ${bookings} booking(s) and cannot be deleted. Deactivate it instead.`
      );
    }

    await service.deleteOne();
    res.json({ success: true, message: `${service.name} was deleted.` });
  } catch (err) {
    console.error("adminDeleteService error:", err);
    fail(res, 500, "Server error");
  }
};
