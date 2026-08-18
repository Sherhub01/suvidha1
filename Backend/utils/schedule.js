// ────────────────────────────────────────────────────────────
// Scheduling helpers
//
// Bookings used to store `date` and `time` as free-text strings, so nothing
// could be sorted, reminded on, or checked for overlap. These turn the customer's
// picks into a real Date and back.
// ────────────────────────────────────────────────────────────

/** Minutes India Standard Time is ahead of UTC. */
const IST_OFFSET_MINS = 330;

const TIME_PATTERNS = [
  // 14:30 / 09:05
  { re: /^(\d{1,2}):(\d{2})$/, parse: (m) => [Number(m[1]), Number(m[2])] },
  // 2:30 PM / 2:30pm
  {
    re: /^(\d{1,2}):(\d{2})\s*([APap][Mm])$/,
    parse: (m) => {
      let h = Number(m[1]) % 12;
      if (m[3].toLowerCase() === "pm") h += 12;
      return [h, Number(m[2])];
    },
  },
  // 2 PM
  {
    re: /^(\d{1,2})\s*([APap][Mm])$/,
    parse: (m) => {
      let h = Number(m[1]) % 12;
      if (m[2].toLowerCase() === "pm") h += 12;
      return [h, 0];
    },
  },
];

/**
 * Combines a date and a time into a Date.
 *
 * Values are interpreted in IST regardless of where the server runs, so a
 * booking made for "9:00" is 9am for the customer and not 9am UTC.
 *
 * @returns {Date|null} null when the input cannot be parsed
 */
export function parseScheduledAt(dateInput, timeInput) {
  if (!dateInput) return null;

  const dateStr = String(dateInput).trim();
  const timeStr = String(timeInput || "").trim();

  // A full ISO timestamp is taken at face value.
  if (/\dT\d/.test(dateStr)) {
    const iso = new Date(dateStr);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }

  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    const loose = new Date(dateStr);
    return Number.isNaN(loose.getTime()) ? null : loose;
  }

  const [, year, month, day] = dateMatch.map(Number);

  let hours = 0;
  let minutes = 0;
  for (const { re, parse } of TIME_PATTERNS) {
    const m = timeStr.match(re);
    if (m) {
      [hours, minutes] = parse(m);
      break;
    }
  }

  if (hours > 23 || minutes > 59) return null;

  // Build the instant as UTC, then shift back by the IST offset.
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes) - IST_OFFSET_MINS * 60000;
  const result = new Date(utcMs);

  return Number.isNaN(result.getTime()) ? null : result;
}

/** Human-readable slot, always rendered in IST. */
export function formatSlot(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** How far ahead a booking may be placed. */
export const MAX_ADVANCE_DAYS = 90;
/** Minimum notice required before the slot. */
export const MIN_NOTICE_MINUTES = 30;

/** @returns {string|null} an error message, or null when the slot is acceptable */
export function validateSlot(scheduledAt, now = new Date()) {
  if (!scheduledAt) return "Please choose a valid date and time.";

  const diffMins = (scheduledAt.getTime() - now.getTime()) / 60000;

  if (diffMins < MIN_NOTICE_MINUTES) {
    return `Bookings need at least ${MIN_NOTICE_MINUTES} minutes' notice. Please pick a later slot.`;
  }

  if (diffMins > MAX_ADVANCE_DAYS * 24 * 60) {
    return `Bookings can be made up to ${MAX_ADVANCE_DAYS} days in advance.`;
  }

  return null;
}

/** Two [start, end) windows overlap when each starts before the other ends. */
export const overlaps = (startA, endA, startB, endB) => startA < endB && startB < endA;
