# UI kit

Shared primitives for all three panels (consumer, staff, admin). Import from
the barrel:

```jsx
import { Button, Input, Card, Modal, Badge, Table } from "@/components/ui";
// or, relative:
import { Button, Input } from "../components/ui";
```

Admin screens may keep importing from `suvidha1-admin/admin/ui.jsx` — that file
is now a thin adapter over this kit, preserving the `Btn` and `FilterSelect`
names it already used.

---

## Files

| File | Contents |
|---|---|
| `tokens.js` | Class-string tokens: radius, surfaces, focus ring, field styles, status colours. Change a value here and every primitive follows. |
| `Button.jsx` | `Button`, `IconButton` |
| `Field.jsx` | `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle` |
| `Surface.jsx` | `Card`, `Badge`, `SectionHeader`, `StatCard`, `Avatar`, `Skeleton`, `Spinner`, `LoadingState`, `EmptyState`, `Alert`, `Chip` |
| `Modal.jsx` | `Modal`, `ConfirmDialog` |
| `DataTable.jsx` | `Table`, `TR`, `TD`, `SearchBar`, `Pagination`, `FilterTabs` |
| `SecureDocLink.jsx` | Opens an auth-protected KYC document |
| `theme.js` | Legacy `THEME` class strings still used by some consumer pages |

---

## Button

One component covers actions and navigation. Pass `to` for a router link,
`href` for an external anchor, neither for a `<button>`.

```jsx
<Button>Save</Button>
<Button variant="secondary" icon={RefreshCw} onClick={reload}>Refresh</Button>
<Button variant="danger" loading={deleting} onClick={remove}>Delete</Button>
<Button to="/bookings" iconRight={ArrowRight}>View bookings</Button>
<IconButton icon={X} label="Close dialog" onClick={close} />
```

`variant`: `primary` · `secondary` · `outline` · `ghost` · `danger` · `success` · `subtle`
`size`: `xs` · `sm` · `md` · `lg`

`loading` disables the button and swaps the leading icon for a spinner, so the
label does not shift. `IconButton` requires `label` — it becomes the accessible
name.

---

## Fields

Every control renders its own `<label htmlFor>`, wires `aria-describedby` to the
hint or error, and sets `aria-invalid` when errored. `type="password"` gets a
show/hide toggle automatically.

```jsx
<Input label="Email" type="email" value={email} onChange={onChange} error={errors.email} required />
<Input label="Password" type="password" hint="At least 8 characters." />
<Select label="Role" options={[{ value: "admin", label: "Admin" }]} placeholder="Choose…" />
<Toggle checked={enabled} onChange={setEnabled} label="Email alerts" />
```

---

## Modal

Portals to `document.body`, traps Tab focus, closes on Escape or backdrop
click, restores focus to the trigger, and locks body scroll. Bottom sheet on
mobile, centred card from `sm` up.

```jsx
<Modal
  open={open}
  onClose={close}
  title="Create admin account"
  description="They can sign in immediately."
  footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={save}>Create</Button></>}
>
  …
</Modal>

<ConfirmDialog open={confirming} message="Delete this account?" onConfirm={remove} onClose={cancel} />
```

---

## Status colours

`Badge` and the tables share one status vocabulary defined in `tokens.js`:
`scheduled` · `confirmed` · `completed` · `cancelled` · `pending` · `approved` ·
`rejected` · `incomplete` · `active` · `paid` · `refunded` · `suspended` ·
`disabled` · `neutral`.

An unrecognised value falls back to `neutral` rather than rendering unstyled.

```jsx
<Badge status={booking.status} />
```

---

## Data loading

Pair the kit with `hooks/useApiData` instead of hand-rolling
load/loading/error state:

```jsx
const fetchStaff = useCallback(({ signal }) => adminApi.get("/staff", { signal }).then(r => r.data), []);
const { data, loading, error, reload } = useApiData(fetchStaff, { pollMs: 15000, initial: [] });

if (loading) return <LoadingState />;
if (error) return <Alert tone="error">{error}</Alert>;
```

Polling pauses automatically while the browser tab is hidden.
