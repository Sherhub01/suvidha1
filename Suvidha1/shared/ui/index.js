// ────────────────────────────────────────────────────────────
// Shared UI kit
//
// Every panel (consumer, staff, admin) imports its primitives from here:
//
//   import { Button, Input, Card, Modal, Badge } from "@/components/ui";
//
// Adding a variant in one place changes it everywhere — no more three
// slightly different button styles.
// ────────────────────────────────────────────────────────────

export { default as Button, IconButton } from "./Button";
export { Input, Textarea, Select, Checkbox, Toggle } from "./Field";
export {
  Card,
  Badge,
  SectionHeader,
  StatCard,
  Avatar,
  Skeleton,
  Spinner,
  LoadingState,
  EmptyState,
  Alert,
  Chip,
} from "./Surface";
export { default as Modal, ConfirmDialog } from "./Modal";
export { Table, TR, TD, SearchBar, Pagination, FilterTabs } from "./DataTable";
export {
  ScrimOverlay,
  ClickableCard,
  ClickableRow,
  FileDropZone,
  DismissButton,
} from "./Interactive";
export { default as SecureDocLink } from "./SecureDocLink";
export { default as ThemeToggle } from "./ThemeToggle";
export { cx, RADIUS, SURFACE, FOCUS_RING, STATUS_TONE, TONE_ACCENT, TEXT, FIELD_TONE } from "./tokens";
