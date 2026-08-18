import { z } from "zod";

// ────────────────────────────────────────────────────────────
// Request validation
//
// Every endpoint used to hand-roll its own if-checks, which is how a booking
// could arrive with no date and a price of zero. Schemas are declared once and
// applied as middleware; the parsed (and coerced) result replaces req.body, so
// controllers work with clean typed values.
// ────────────────────────────────────────────────────────────

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {"body"|"query"|"params"} source
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path?.join(".") || source;

    return res.status(400).json({
      success: false,
      message: issue?.message || "Invalid request.",
      field,
      errors: result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // req.query is a getter in Express 5 and cannot be reassigned.
  if (source === "query") {
    req.validatedQuery = result.data;
  } else {
    req[source] = result.data;
  }

  return next();
};

// ── Reusable field schemas ─────────────────────────────────

export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid id.");

export const isoDate = z.coerce.date({ message: "Must be a valid date." });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional().default(""),
});

// ── Bookings ───────────────────────────────────────────────

export const createBookingSchema = z.object({
  staffId: objectId,
  serviceSlug: z.string().trim().min(1, "A service is required.").max(60),
  // Accepts "2026-09-01" plus a "14:30" time, or a full ISO timestamp.
  date: z.string().trim().min(1, "Please choose a date."),
  time: z.string().trim().min(1, "Please choose a time."),
  address: z.string().trim().min(8, "Please enter a full address.").max(500),
  description: z.string().trim().max(2000).optional().default(""),
  // Hours, for hourly services.
  quantity: z.coerce.number().int().min(1).max(24).optional().default(1),
  paymentMethod: z.enum(["cash", "razorpay"]).optional().default("cash"),
  coordinates: z
    .object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) })
    .optional(),
});

export const quoteSchema = createBookingSchema.pick({
  staffId: true,
  serviceSlug: true,
  quantity: true,
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(500).optional().default(""),
});

export const rejectBookingSchema = z.object({
  reason: z.string().trim().min(3, "Please give a reason.").max(500),
});

// ── Reviews ────────────────────────────────────────────────

export const createReviewSchema = z.object({
  bookingId: objectId,
  rating: z.coerce.number().int().min(1, "Rating must be 1–5.").max(5, "Rating must be 1–5."),
  comment: z.string().trim().max(1000).optional().default(""),
  punctuality: z.coerce.number().int().min(1).max(5).optional().nullable(),
  quality: z.coerce.number().int().min(1).max(5).optional().nullable(),
  behaviour: z.coerce.number().int().min(1).max(5).optional().nullable(),
});

export const replyReviewSchema = z.object({
  reply: z.string().trim().min(1, "Reply cannot be empty.").max(1000),
});

// ── Payments ───────────────────────────────────────────────

export const createOrderSchema = z.object({
  bookingId: objectId,
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

// ── Payouts ────────────────────────────────────────────────

export const requestPayoutSchema = z.object({
  // Rupees from the client; converted to paise in the controller.
  amount: z.coerce.number().positive("Enter an amount greater than zero.").max(1000000),
  method: z.enum(["bank", "upi"]),
});

export const processPayoutSchema = z.object({
  status: z.enum(["approved", "processing", "paid", "rejected"]),
  reference: z.string().trim().max(120).optional(),
  rejectionReason: z.string().trim().max(500).optional(),
});

// ── Services (admin) ───────────────────────────────────────

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only.")
    .max(60),
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500).optional().default(""),
  icon: z.string().trim().max(8).optional().default("🔧"),
  basePrice: z.coerce.number().min(0),
  visitFee: z.coerce.number().min(0).optional().default(0),
  priceType: z.enum(["fixed", "hourly"]).optional().default("fixed"),
  minPrice: z.coerce.number().min(0).optional().default(0),
  maxPrice: z.coerce.number().min(0).optional().default(100000),
  commissionPercent: z.coerce.number().min(0).max(100).optional().default(15),
  taxPercent: z.coerce.number().min(0).max(100).optional().default(18),
  defaultDurationMins: z.coerce.number().int().min(15).max(1440).optional().default(60),
  isActive: z.coerce.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const serviceUpdateSchema = serviceSchema.partial().omit({ slug: true });

export { z };
