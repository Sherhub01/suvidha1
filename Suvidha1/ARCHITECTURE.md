# Frontend architecture

Each role is a top-level folder. One Vite project, one build, one deploy — but
the three role apps are kept apart in the source tree so nothing in the consumer
app can reach into staff or admin code.

```
Suvidha1/
├── index.html          Single entry document
├── main.jsx            Mounts <App />
├── App.jsx             Composes the four route factories — nothing else
│
├── auth/               Public sign-in / sign-up / OTP
├── consumer/           Customer app   → /dashboard, /services, /bookings, /map
├── staff/              Professional app → /staff/*
├── admin/              Back office    → /admin/*
│
├── app/                guards.jsx — every access decision lives here
├── shared/             Code used by two or more apps
├── assets/             Images
└── public/             Static files served as-is
```

## Rule: no cross-app imports

A file inside `consumer/` may import from `shared/`, `app/`, or its own folder —
never from `staff/` or `admin/`. The one deliberate exception is the consumer app
reusing `auth/pages/CreateProfile`.

Check it at any time:

```bash
grep -rn "from \"\.\./\.\./\(staff\|admin\)/" consumer/
grep -rn "from \"\.\./\.\./\(consumer\|admin\)/" staff/
```

Both should print nothing.

## Folder shape

Every role folder follows the same layout:

```
<role>/
├── routes.jsx      Route subtree, composed by App.jsx
├── pages/          One file per screen
├── components/     Components only this role uses
├── layout/         Shell: sidebar, top bar, outlet wrapper
├── services/       Role-specific endpoint map (optional)
└── context/        Role-specific providers (optional)
```

## What goes where

| Need | Location |
|---|---|
| Buttons, inputs, modals, tables, badges | `shared/ui/` |
| Reviews, gallery, error boundary, 404 | `shared/components/` |
| Data-fetching / payment hooks | `shared/hooks/` |
| API endpoint map | `shared/services/api.js` |
| Axios clients, auth headers, 401 handling | `shared/services/http.js` |
| Session and role storage | `shared/session.js` |
| Backend URL, asset URL helper | `shared/config.js` |
| Route guards | `app/guards.jsx` |
| Anything only one role uses | that role's own folder |

## Session and roles

`shared/session.js` is the single source of truth. Two rules keep the router and
the API in agreement:

1. The session is **one object under one key**, read and written atomically —
   token, role and user can never come from different storage.
2. The role is **derived from the JWT**, not from a separate stored field, so a
   stale or tampered role cannot disagree with the token the server will see.

This is what fixed the role mismatch: the previous build fell back field by field
between `localStorage` and `sessionStorage`, so a consumer token could be paired
with a staff role — the router would admit the user and every request then 403'd.

`app/guards.jsx` reads only from that module. Guards are a convenience layer:
every protected endpoint is independently enforced server-side by
`protect` + `requireRole`.

## Routing

`App.jsx` mounts four route factories and nothing else:

```jsx
<Routes>
  {authRoutes()}
  {consumerRoutes()}
  {staffRoutes()}
  {adminRoutes()}
  <Route path="*" element={<CatchAll />} />
</Routes>
```

Every screen is `lazy()`-loaded inside its own `routes.jsx`, so a consumer never
downloads the staff or admin bundle.

## Adding a screen

1. Create the file under `<role>/pages/`.
2. Add a `lazy()` import and a `<Route>` in that role's `routes.jsx`.
3. Import primitives from `../../shared/ui`, hooks from `../../shared/hooks`,
   endpoints from `../../shared/services/api`.

Do not edit `App.jsx` — it only composes the route factories.

## Build

```bash
npm run dev      # Vite dev server on :5173
npm run build    # -> dist/
npm run lint
```

Tailwind scans each role folder explicitly — see `content` in
`tailwind.config.js`. A new top-level folder must be added there or its classes
will be stripped from the build.
