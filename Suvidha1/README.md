# Apps

Each role owns one folder here. Nothing inside an app folder may import from a
sibling app — verified in review, and the reason a consumer screen can no longer
reach staff or admin code by accident.

```
apps/
  auth/       Public sign-in / sign-up / OTP screens
  consumer/   Customer app  — /dashboard, /services, /bookings, /map
  staff/      Professional app — /staff/*
  admin/      Back office — /admin/*
```

## Folder shape

Every app follows the same layout:

```
<app>/
  routes.jsx     Route subtree, composed by src/App.jsx
  pages/         One file per screen
  components/    Components used only by this app
  layout/        Shell: sidebar, top bar, outlet wrapper
  services/      App-specific endpoint map (optional)
  context/       App-specific providers (optional)
```

## What goes where

| Need | Location |
|---|---|
| Used by two or more apps | `src/shared/` |
| Buttons, inputs, modals, tables | `src/shared/ui/` |
| Data fetching hooks | `src/shared/hooks/` |
| API endpoint map | `src/shared/services/api.js` |
| Session / auth storage | `src/shared/session.js` |
| Route guards | `src/app/guards.jsx` |
| Only one app uses it | that app's own folder |

## Roles and routing

`src/app/guards.jsx` owns every access decision. The signed-in role is read from
the JWT via `session.getRole()` — never from a separate stored field — so the
router and the API can never disagree about who is signed in. That mismatch was
the cause of the 403s the app used to show after switching roles.

Guards are a convenience layer only: every protected endpoint is independently
enforced server-side by `protect` + `requireRole`.

## Adding a screen

1. Create the file under `<app>/pages/`.
2. Add a `lazy()` import and a `<Route>` in that app's `routes.jsx`.
3. Import primitives from `../../shared/ui`, data hooks from
   `../../shared/hooks`, and endpoints from `../../shared/services/api`.

Do not touch `src/App.jsx` — it only composes the four route factories.
