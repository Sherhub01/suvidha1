# Suvidha1 — Frontend

React + Vite SPA for the Suvidha1 service-booking platform.  
Three separate panels run from a single codebase: **Consumer**, **Professional (Staff)**, and **Admin**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Alerts/Modals | SweetAlert2 |
| Maps | Leaflet (dynamic import) |
| State | React Context API |

---

## Project Structure

```
Suvidha1/
├── public/
│   └── favicon.svg
├── src/
│   ├── Auth/                     # Shared login/signup/OTP pages
│   │   ├── login.jsx             # Role-switching login (consumer / professional)
│   │   ├── signup.jsx
│   │   ├── otp.jsx
│   │   ├── forgotPass.jsx
│   │   ├── withEmail.jsx
│   │   ├── WelcomePage.jsx
│   │   ├── CreateProfile.jsx     # Consumer profile setup
│   │   └── createUsername.jsx
│   │
│   ├── consumer/                 # Consumer panel pages
│   │   ├── Dashboard.jsx         # Consumer home with recent bookings
│   │   ├── Services.jsx          # Service category grid
│   │   ├── ServiceDetails.jsx    # Single category detail
│   │   ├── WorkerList.jsx        # List of professionals in a category
│   │   ├── WorkerProfile.jsx     # Professional detail + BOOKING FORM
│   │   ├── Bookings.jsx          # Consumer's bookings list + detail modal
│   │   ├── Notifications.jsx     # Real ConsumerAlerts from backend
│   │   ├── MapPage.jsx           # Map view of nearby professionals
│   │   ├── Settings.jsx
│   │   ├── EditProfile.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── About.jsx
│   │   ├── ContactUs.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── TermsConditions.jsx
│   │
│   ├── staff/                    # Professional panel pages
│   │   ├── Dashboard.jsx         # Stats, upcoming jobs, recent activity
│   │   ├── Bookings.jsx          # All assigned bookings + accept/complete
│   │   ├── Notifications.jsx     # StaffAlerts — new booking notifications
│   │   ├── CreateProfile.jsx     # 8-step profile wizard
│   │   ├── Verification.jsx      # Document upload wizard
│   │   ├── Profile.jsx           # View/edit own profile
│   │   ├── Earnings.jsx          # Earnings summary
│   │   ├── Map.jsx               # Location sharing map
│   │   ├── Settings.jsx
│   │   ├── PendingApproval.jsx   # Shown while admin hasn't approved yet
│   │   ├── Welcome.jsx           # First-login welcome screen
│   │   ├── Layout.jsx            # Staff shell with sidebar
│   │   ├── staffAPI.js           # Axios instance for staff API calls
│   │   ├── theme.js              # Dark theme color tokens
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── BookingCard.jsx
│   │       └── StatsCard.jsx
│   │
│   ├── suvidha1-admin/admin/     # Admin panel pages
│   │   ├── AdminLogin.jsx
│   │   ├── AdminSignup.jsx
│   │   ├── AdminForgotPassword.jsx
│   │   ├── Home.jsx              # Admin shell with sidebar
│   │   ├── Dashboard.jsx         # Stats overview
│   │   ├── BookingManagement.jsx # All bookings table + detail modal
│   │   ├── StaffApproval.jsx     # Approve / reject professionals
│   │   ├── StaffManagement.jsx   # All professionals list
│   │   ├── ConsumerManagement.jsx
│   │   ├── ServicesManagement.jsx
│   │   ├── Analytics.jsx
│   │   ├── Reports.jsx
│   │   ├── Payments.jsx
│   │   ├── Notifications.jsx     # Broadcast notifications
│   │   ├── Settings.jsx
│   │   ├── Profile.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── ui.jsx                # Reusable UI components (Table, Badge, Modal…)
│   │   ├── index.jsx             # Named exports of auth pages
│   │   └── services/
│   │       ├── api.js            # Admin axios instance
│   │       └── hooks.js          # Admin data-fetching hooks
│   │
│   ├── context/
│   │   ├── BookingsContext.jsx   # Consumer bookings state + polling
│   │   └── NotificationsContext.jsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx  # Consumer shell (sidebar + topbar)
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopBar.jsx
│   │   └── ErrorBoundary.jsx
│   │
│   ├── hooks/
│   │   └── useGeolocation.js
│   │
│   ├── App.jsx       # All routes + route guards
│   ├── main.jsx      # React root, wraps BookingsProvider
│   ├── session.js    # Tab-isolated auth storage (KEY FILE)
│   ├── api.jsx       # Shared axios instance + SERVICES data + THEME tokens
│   └── index.css
│
├── index.html        # Consumer/Staff entry point (id="root")
├── admin.html        # Admin entry point (id="root")
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## How to Run

```bash
cd Suvidha1
npm install
npm run dev    # starts at http://localhost:5173
```

Open three separate browser tabs:
- `http://localhost:5173/` → Consumer login
- `http://localhost:5173/` → Professional login (same URL, switch role toggle)
- `http://localhost:5173/admin/login` → Admin login

---

## Tab Isolation — The Most Important Concept

Because **consumer and professional can be open in separate tabs simultaneously**, auth tokens must be **tab-isolated**. This is handled entirely by `session.js`.

### `src/session.js`
```js
// Each tab gets a unique ID stored in sessionStorage (not shared across tabs)
const TAB_KEY = "suvidha_tab_" + (sessionStorage.getItem("_tabId") || (() => {
  const id = Math.random().toString(36).slice(2);
  sessionStorage.setItem("_tabId", id);
  return id;
})());

export const session = {
  setToken: (v) => sessionStorage.setItem(`${TAB_KEY}_token`, v),
  getToken: ()  => sessionStorage.getItem(`${TAB_KEY}_token`),
  setRole:  (v) => sessionStorage.setItem(`${TAB_KEY}_role`, v),
  getRole:  ()  => sessionStorage.getItem(`${TAB_KEY}_role`),
  setUser:  (v) => sessionStorage.setItem(`${TAB_KEY}_user`, JSON.stringify(v)),
  getUser:  ()  => JSON.parse(sessionStorage.getItem(`${TAB_KEY}_user`) || "null"),
  clear:    ()  => { /* removes all three */ },
};
```

**Why this matters:**  
`localStorage` is shared across all tabs of the same origin. If consumer logs in on Tab A, it overwrites `localStorage.token`, and Tab B (professional) would start using the consumer's token — showing wrong data and failing API calls.

`sessionStorage` is isolated per tab, so each tab has its own `_tabId` and therefore its own token/role/user.

**Rule:** Every Axios interceptor in the app reads `session.getToken()` — never `localStorage.getItem("token")`.

---

## Routing — `App.jsx`

All three panels live under one React Router `BrowserRouter`.

```
/                    → Login page
/login               → Login page
/signup              → Signup
/dashboard           → Consumer panel (requires consumer token)
/staff/dashboard     → Professional panel (requires staff token)
/admin/dashboard     → Admin panel (requires admin token)
```

### Route Guards

```jsx
// Only lets through if session has a valid consumer token
function RequireConsumer({ children }) {
  const token = session.getToken();
  const role  = session.getRole();
  if (!token) return <Navigate to="/login" />;
  if (role !== "consumer") return <Navigate to="/staff/dashboard" />;
  return children;
}

// Only lets through if session has a valid staff token
function RequireStaff({ children }) { ... }

// Only lets through if adminSession has a valid admin token
function RequireAdmin({ children }) { ... }
```

---

## Key Flows

### 1. Consumer Books a Professional

```
Services → ServiceDetails → WorkerList (GET /api/staff/approved?status=approved&category=X)
  └── WorkerCard → WorkerProfile
  └── User fills BookingModal (date, time, address, description)
  └── POST /api/bookings  with session token
        │
        Backend: creates Booking + StaffAlert
        │
  └── BookingsContext.addBooking(data.booking)  ← updates consumer's list instantly
  └── ConfirmedModal shown
```

### 2. Professional Receives Notification

```
staff/Notifications.jsx
  └── Polls GET /api/bookings/alerts every 15 seconds
  └── Renders alert list with unread dot indicator
  └── On tap → AlertDetailModal shows full booking details
        ├── "Accept Booking" → PATCH /api/bookings/:id/accept
        │       Backend: status = "Confirmed" + creates ConsumerAlert
        └── "Mark as Completed" → PATCH /api/bookings/:id/done
```

### 3. Professional's Dashboard Shows New Job

```
staff/Dashboard.jsx
  └── GET /api/bookings/staff on mount
  └── Filters status="Scheduled"|"Confirmed" → shows in "Upcoming Jobs"
  └── Stats cards count bookings by status
```

### 4. Consumer Sees Status Update

```
consumer/Notifications.jsx
  └── Polls GET /api/bookings/consumer-alerts every 15 seconds
  └── Shows "Booking Confirmed: Plumber" when professional accepts
  └── Tap → navigates to /bookings

consumer/Bookings.jsx (via BookingsContext)
  └── Polls GET /api/bookings/consumer every 15 seconds
  └── Status badge updates from "Scheduled" → "Confirmed" automatically
```

### 5. Admin Views All Bookings

```
admin/BookingManagement.jsx
  └── GET /api/admin/bookings?page=1&status=...  (admin token)
  └── Shows table: Consumer Name | Staff Name | Service | Date | Status
  └── "View" button → detail modal with all fields
```

---

## BookingsContext — Consumer State

`src/context/BookingsContext.jsx` is the single source of truth for consumer bookings.

```jsx
export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);

  const load = useCallback(async () => {
    const token = session.getToken();  // tab-isolated
    if (!token) return;
    const { data } = await API.get("/bookings/consumer");
    if (data.success) setBookings(data.bookings.map(normalise));
  }, []);

  // Poll every 15s — status changes from professional appear automatically
  useEffect(() => {
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  // Normalise MongoDB doc → UI shape
  function normalise(b) {
    return {
      id: b._id, workerName: b.workerName,
      status: b.status, date: b.date, ...
    };
  }
}
```

Wrap in `main.jsx`:
```jsx
createRoot(document.getElementById("root")).render(
  <BookingsProvider>
    <App />
  </BookingsProvider>
);
```

---

## Professional Panel — Dark Theme

All staff pages use `staff/theme.js` color tokens:

```js
export const T = {
  pageBg:    "#0A0F1E",
  cardBg:    "#0F172A",
  cardBorder:"#1E293B",
  heading:   "#F1F5F9",
  text:      "#CBD5E1",
  subText:   "#64748B",
  primary:   "#EC4899",   // pink
  success:   "#10B981",
  warning:   "#F59E0B",
  danger:    "#EF4444",
  info:      "#3B82F6",
};
```

---

## Admin Panel — Reusable UI (`ui.jsx`)

`suvidha1-admin/admin/ui.jsx` exports ready-made components used across all admin pages:

| Component | Purpose |
|---|---|
| `Card` | White card container |
| `Table` | Responsive table with header row |
| `TR / TD` | Table row/cell |
| `Badge` | Coloured status pill (scheduled/confirmed/completed/cancelled) |
| `Btn` | Button with variant (primary/outline/danger) |
| `Modal` | Overlay modal with title + close |
| `SearchBar` | Debounced search input |
| `FilterSelect` | Dropdown filter |
| `Pagination` | Page prev/next with count |
| `Avatar` | Initials fallback avatar |
| `SectionHeader` | Page title + subtitle |

---

## API Instance Pattern

Every page/context creates its own Axios instance:

```js
import { session } from "../session";

const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = session.getToken();          // ← ALWAYS session, never localStorage
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
```

Admin pages use `adminSession.getToken()` instead:
```js
import { adminSession } from "../../session";
const t = adminSession.getToken() || localStorage.getItem("admin_token");
```

---

## Login Flow

```
login.jsx
  │
  ├── Role toggle: Consumer / Professional
  ├── POST /api/auth/login { identifier, password, role }
  │
  ├── On success:
  │     session.setToken(token)   ← stored in tab's sessionStorage
  │     session.setUser(user)
  │     session.setRole(role)
  │     localStorage.setItem("user", ...)  ← only non-auth profile data
  │
  └── Navigate:
        consumer + profileCompleted  → /dashboard
        consumer + !profileCompleted → /create-profile
        staff    + profileCompleted  → /staff/dashboard
        staff    + !profileCompleted → /staff/welcome
```

---

## Services Data (`api.jsx`)

All 16 service categories are defined as static data in `api.jsx`:

```js
export const SERVICES = [
  { slug: "electrician", name: "Electrician", icon: Zap,
    startingPrice: 199, priceType: "hourly", ... },
  { slug: "plumber", name: "Plumber", ... },
  // ... 14 more
];
export const getCategoryBySlug = (slug) => SERVICES.find(s => s.slug === slug);
```

These are used in `Services.jsx`, `ServiceDetails.jsx`, `WorkerProfile.jsx` etc.

---

## Why Professionals Weren't Showing in Consumer Dashboard

The original `WorkerList.jsx` and `Dashboard.jsx` were calling `/api/staff/admin/list` which is protected by `protectAdmin` middleware — it requires an **admin JWT**, not a consumer JWT. Consumer requests were being rejected with 401.

**Fix applied:**
- Added `/api/staff/approved` route in `staffRoutes.js` protected by `protect` (user JWT)
- Both `WorkerList.jsx` and `Dashboard.jsx` now call `/api/staff/approved?status=approved`
- All axios interceptors use `session.getToken()` (tab-isolated)

---

## Why Admin Couldn't See Professional Name in Bookings

The `Booking` document stores `workerName` as a **denormalized string** field at creation time. The `staff` ObjectId reference is also stored but `populate()` only works if the User document still exists. If `staff` field is null or the User was deleted, the name was blank.

**Fix applied:**
- `adminGetAllBookings` now enriches each booking: `workerName = b.workerName || populated staff name`
- `BookingManagement.jsx` table and detail modal both use `workerName` as fallback
- Search also includes `workerName` field

---

The app does not use WebSockets. Instead it uses **polling**:

| Panel | Endpoint | Interval | Purpose |
|---|---|---|---|
| Consumer Bookings | `/bookings/consumer` | 15s | Status changes appear automatically |
| Consumer Notifications | `/bookings/consumer-alerts` | 15s | Booking confirmed alerts |
| Staff Notifications | `/bookings/alerts` | 15s | New booking alerts |
| Staff Dashboard | `/bookings/staff` | On mount | Upcoming jobs |

---

## Environment / Ports

| Service | Port |
|---|---|
| Vite dev server | 5173 |
| Backend API | 5000 |

Backend URL is hardcoded as `http://localhost:5000` in all Axios instances.  
To change for production, replace all occurrences with your deployed backend URL.
