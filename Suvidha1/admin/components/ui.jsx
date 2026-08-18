// ────────────────────────────────────────────────────────────
// Admin UI adapter
//
// The admin panel used to carry its own copy of every primitive. It now maps
// onto the shared kit in src/components/ui so there is a single Button, Modal,
// Table and Badge implementation across all three panels.
//
// Only the admin-specific naming (`Btn`, `FilterSelect`) and the two
// prop-shape differences live here. New admin screens should import from
// "../../components/ui" directly.
// ────────────────────────────────────────────────────────────

import Button from "../../shared/ui/Button";
import { Select } from "../../shared/ui/Field";
import { Pagination as BasePagination } from "../../shared/ui/DataTable";

export {
  Card,
  Badge,
  StatCard,
  SectionHeader,
  Avatar,
  Skeleton,
  Spinner,
  LoadingState,
  EmptyState,
  Alert,
  Chip,
} from "../../shared/ui/Surface";

export { Table, TR, TD, SearchBar, FilterTabs } from "../../shared/ui/DataTable";
export { default as Modal, ConfirmDialog } from "../../shared/ui/Modal";
export { Input, Textarea, Select, Checkbox, Toggle } from "../../shared/ui/Field";
export { default as Button, IconButton } from "../../shared/ui/Button";

/** Legacy alias — admin screens call the button `Btn`. */
export const Btn = Button;

/** Admin filter dropdown: bare `value`/`onChange` rather than a form event. */
export function FilterSelect({ value, onChange, options = [], placeholder = "All", className = "" }) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={options}
      placeholder={placeholder}
      className={className}
      aria-label={placeholder}
    />
  );
}

/**
 * Admin pages pass `totalPages` + `setPage`; the shared component works from
 * `total` + `perPage`. Bridge the two so both call sites stay readable.
 */
export function Pagination({ page, totalPages, setPage, total, perPage = 15, onChange }) {
  const resolvedTotal = total ?? (totalPages ?? 1) * perPage;

  return (
    <BasePagination
      page={page}
      total={resolvedTotal}
      perPage={perPage}
      onChange={onChange ?? setPage}
    />
  );
}
