import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { cx, FOCUS_RING, SURFACE } from "./tokens";

// ────────────────────────────────────────────────────────────
// Interactive surfaces
//
// These replace the `<div onClick={...}>` patterns scattered across the app.
// A div with a click handler is invisible to keyboard and screen-reader users:
// it cannot be focused, Enter and Space do nothing, and nothing announces that
// it is actionable. Each component below uses a real button (or adds role,
// tabIndex and key handling where a button element would break the layout).
// ────────────────────────────────────────────────────────────

/**
 * Dimming layer behind a mobile drawer or dialog.
 *
 * Rendered as a real button so Escape-free keyboard users can still dismiss it,
 * and given an accessible name rather than being an anonymous clickable div.
 */
export function ScrimOverlay({ onClose, label = "Close", className = "", zIndex = "z-40" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClose}
      className={cx(
        "fixed inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm",
        zIndex,
        className
      )}
    />
  );
}

/**
 * A card that behaves like a button.
 *
 * Renders an actual <button> with the card styling, so focus, Enter and Space
 * all work without hand-wiring key handlers at each call site.
 */
export function ClickableCard({
  onClick,
  children,
  className = "",
  padded = true,
  ariaLabel,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "w-full rounded-2xl text-left disabled:cursor-not-allowed disabled:opacity-60",
        SURFACE.cardHover,
        padded && "p-4",
        FOCUS_RING,
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * A clickable row inside a list.
 *
 * Kept as a div because a <button> cannot contain the block layout these rows
 * use, so role, tabIndex and key handling are supplied explicitly instead.
 */
export function ClickableRow({ onClick, children, className = "", ariaLabel }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event);
        }
      }}
      className={cx("cursor-pointer", FOCUS_RING, className)}
    >
      {children}
    </div>
  );
}

/**
 * File picker with drag-and-drop.
 *
 * The visible drop zone is a button that opens the hidden file input, so it is
 * reachable by Tab and activated by Enter — a plain div wrapper was not.
 */
export function FileDropZone({
  onFiles,
  accept,
  multiple = false,
  label = "Choose a file",
  hint,
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const emit = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles?.(multiple ? files : files[0]);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          emit(event.target.files);
          // Allow re-selecting the same file.
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          emit(event.dataTransfer?.files);
        }}
        className={cx(
          "flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 transition",
          dragging
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
            : "border-slate-200 bg-slate-50 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
          FOCUS_RING
        )}
      >
        <UploadCloud size={22} className="text-slate-400" aria-hidden="true" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
        <span className="text-[11px] text-slate-400">or drag and drop</span>
      </button>
    </div>
  );
}

/** Small dismiss button for chips, previews and uploaded-file rows. */
export function DismissButton({ onClick, label = "Remove", className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 " +
          "transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300",
        FOCUS_RING,
        className
      )}
    >
      <X size={13} aria-hidden="true" />
    </button>
  );
}
