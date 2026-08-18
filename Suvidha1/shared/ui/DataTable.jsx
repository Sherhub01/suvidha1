import { useId } from "react";
import { ChevronLeft, ChevronRight, Search, Inbox } from "lucide-react";
import Button, { IconButton } from "./Button";
import { EmptyState, LoadingState } from "./Surface";
import { cx, FIELD_BASE, FIELD_STATE, FOCUS_RING } from "./tokens";

/**
 * Table shell. Always scrolls horizontally inside its own container so a wide
 * table never forces the page body to scroll sideways on mobile.
 */
export function Table({ headers = [], children, loading = false, empty, className = "" }) {
  if (loading) return <LoadingState />;

  return (
    <div className={cx("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-[13px]">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map((header) => (
              <th
                key={typeof header === "string" ? header : header.key}
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {typeof header === "string" ? header : header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>

      {empty && (
        <EmptyState icon={Inbox} title={empty} />
      )}
    </div>
  );
}

/** Table row. Pass `onClick` to make the whole row activate — it stays keyboard reachable. */
export function TR({ children, onClick, className = "" }) {
  const interactive = Boolean(onClick);

  return (
    <tr
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      className={cx(
        "border-b border-slate-50 transition",
        interactive && cx("cursor-pointer hover:bg-slate-50/70", FOCUS_RING),
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className = "", ...rest }) {
  return (
    <td className={cx("px-4 py-3 align-middle text-slate-700", className)} {...rest}>
      {children}
    </td>
  );
}

/** Debounce-free search box — the caller decides when to fire the query. */
export function SearchBar({ value, onChange, placeholder = "Search…", className = "", label = "Search" }) {
  const id = useId();

  return (
    <div className={cx("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={cx(FIELD_BASE, FIELD_STATE.normal, "pl-10")}
      />
    </div>
  );
}

/**
 * Page navigator. Renders nothing for a single page, so callers can drop it in
 * unconditionally.
 */
export function Pagination({ page, total, perPage, onChange, className = "" }) {
  const pageCount = Math.max(1, Math.ceil((total || 0) / (perPage || 1)));
  if (pageCount <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav
      aria-label="Pagination"
      className={cx("flex flex-wrap items-center justify-between gap-3 px-1 pt-4", className)}
    >
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <IconButton
          icon={ChevronLeft}
          label="Previous page"
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        />
        <span className="px-2 text-xs font-semibold text-slate-600" aria-current="page">
          {page} / {pageCount}
        </span>
        <IconButton
          icon={ChevronRight}
          label="Next page"
          size="sm"
          variant="secondary"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        />
      </div>
    </nav>
  );
}

/** Segmented filter row — shared by the bookings and staff list screens. */
export function FilterTabs({ tabs = [], value, onChange, className = "" }) {
  return (
    <div role="tablist" className={cx("flex flex-wrap gap-1.5", className)}>
      {tabs.map((tab) => {
        const tabValue = typeof tab === "string" ? tab : tab.value;
        const tabLabel = typeof tab === "string" ? tab : tab.label;
        const active = tabValue === value;

        return (
          <Button
            key={tabValue || "all"}
            role="tab"
            aria-selected={active}
            size="sm"
            variant={active ? "primary" : "secondary"}
            onClick={() => onChange(tabValue)}
          >
            {tabLabel}
            {typeof tab === "object" && tab.count != null && (
              <span
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
