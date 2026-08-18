# Security notes — Suvidha1 backend

What is enforced today, and what still needs doing. Read this before deploying.

---

## Before you deploy — required

1. **Rotate every credential that was ever committed or shared.**
   The previous `.env` contained live values for Gmail, Cloudinary, Groq and
   OpenAI. Treat all of them as compromised and issue new ones.

2. **Set `NODE_ENV=production`.** Several safeguards key off it, and the local
   MongoDB fallback in `config/db.js` is disabled only in production.

3. **Set a strong `JWT_SECRET`** (32+ characters). The server refuses to start
   in production with a shorter one.
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. **Set `FRONTEND_URL` and `ADMIN_URL`** to your exact deployed origins. CORS
   is an explicit allow-list — the old `*.vercel.app` wildcard is gone, so any
   origin you do not list is rejected.

5. **Seed the first admin via `SEED_ADMIN_EMAIL`.** Leave
   `SEED_ADMIN_PASSWORD` empty and the server generates a random password,
   prints it once to the log, and flags the account so it must be changed.

6. **Move uploads off local disk.** `uploads/` is ephemeral on Render and Vercel
   — avatars and KYC documents disappear on every redeploy. Cloudinary is
   already wired up for the gallery; the same treatment is needed here.

---

## What is enforced

| Area | Control |
|---|---|
| Admin creation | No public route. `POST /api/admin/accounts` requires a signed-in **super admin**. |
| Admin tokens | Real JWTs only — the `demo_admin_token` / `ADMIN_SECRET` bypass is removed. 12h expiry. |
| Role separation | Roles are embedded in the JWT and enforced by `requireRole` on every consumer/staff route. Admin tokens are rejected on user routes and vice versa. |
| Staff self-approval | `POST /api/staff/step` copies only a per-step field whitelist. `status`, `rating`, `reviewsCount` and `approvedBy` can never be set by the applicant. |
| KYC documents | Stored outside the public mount with randomised filenames. Readable only via `GET /api/staff/document/:profileId/:field` by the owning professional or an admin. |
| KYC in API responses | The consumer-facing profile endpoint selects an explicit public field list — Aadhaar, PAN and bank details are never returned. |
| Passwords | Minimum 8 characters with a letter and a digit, enforced on signup, reset and change. bcrypt cost 12. Legacy plaintext rows are refused rather than compared. |
| Account enumeration | Login and forgot-password return identical responses whether or not the account exists. |
| OTPs | Hashed (SHA-256) at rest, attempt-limited, and never returned in an API response. `OTP_DEBUG_MODE` only writes to the server log, and is ignored in production. |
| Rate limiting | Global 600/15min, login 10/15min, OTP 5/10min, signup 15/hr, uploads 40/15min, AI 25/5min. |
| Injection | `$`-prefixed and dotted keys are stripped from body, params and query. |
| Headers | Helmet: HSTS, nosniff, frame options, referrer policy. |
| Uploads | MIME allow-list, size caps, random filenames, JSON error responses. |
| Error handling | Internal errors are logged, never returned to the client. |
| Startup | Missing `JWT_SECRET`/`MONGO_URI` fails fast. Graceful SIGTERM/SIGINT shutdown. |

---

## Known gaps (not yet addressed)

These are real and should be planned before taking payments or scaling:

- **No payment gateway.** Bookings are cash-only. The privacy policy and terms
  reference Razorpay, PCI-DSS and escrow — none of that exists yet. Either build
  it or correct the copy before going live.
- **Booking price comes from the client.** `POST /api/bookings` accepts whatever
  `price` the browser sends. It must be derived server-side from the
  professional's profile.
- **No token revocation.** A stolen JWT stays valid until it expires. Add a
  refresh-token flow with a server-side denylist.
- **Ratings are not aggregated.** `PATCH /bookings/:id/rate` writes to the
  booking but never updates `StaffProfile.rating` / `reviewsCount`, and does not
  validate the 1–5 range or require a completed booking.
- **No booking conflict check.** The same professional can be booked into the
  same slot repeatedly.
- **`date` / `time` are strings.** Sorting, reminders and "today's jobs" cannot
  be done reliably until these become real `Date` values.
- **Consumers can self-complete bookings.** `PATCH /bookings/:id/complete` does
  not require the professional to have confirmed first.
- **No audit log.** Admin deletions and approvals leave no trail.
- **No automated tests.** Nothing guards these controls against regression.

---

## Verifying the controls

With the server running:

```bash
B=http://127.0.0.1:5000

# Admin backdoor rejected (401)
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer demo_admin_token" $B/api/admin/stats

# Public admin signup gone (404)
curl -s -o /dev/null -w "%{http_code}\n" -X POST $B/api/admin/signup

# KYC documents not publicly served (404)
curl -s -o /dev/null -w "%{http_code}\n" $B/uploads/docs/anything.jpg

# Weak password rejected
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"firstName":"A","lastName":"B","email":"t@x.com","phone":"9876543210","password":"abc12","role":"consumer"}' \
  $B/api/auth/signup

# NoSQL operator injection neutralised
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"identifier":"a@b.com","password":{"$ne":null},"role":"consumer"}' \
  $B/api/auth/login
```
