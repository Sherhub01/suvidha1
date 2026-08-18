import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import Button, { IconButton } from "./Button";
import { cx } from "./tokens";

const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: renders in a portal, traps Tab focus, restores focus to
 * the trigger on close, closes on Escape or backdrop click, and locks body
 * scroll while open.
 *
 * On mobile it slides up as a bottom sheet; from `sm` it is a centred card.
 */
export default function Modal({
  open = true,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  className = "",
  // Escape hatches for screens with their own visual language (the staff panel
  // uses a dark theme driven by inline styles). They keep their look while
  // still getting the portal, focus trap, Escape handling and scroll lock.
  panelStyle,
  bodyClassName = "",
  hideHeader = false,
  ariaLabel,
}) {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;

    restoreRef.current = document.activeElement;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector(FOCUSABLE);
    (firstFocusable ?? panel)?.focus?.();

    // Bound on the document rather than a JSX handler, so Escape and the Tab
    // trap work no matter where focus currently sits.
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Dismiss layer. A real button rather than a clickable div, so it has an
          accessible name and can be reached without a pointer. */}
      {closeOnBackdrop && (
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => onClose?.()}
          className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        />
      )}
      {!closeOnBackdrop && (
        <span aria-hidden="true" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? ariaLabel : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        style={panelStyle}
        className={cx(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:rounded-2xl",
          !panelStyle && "bg-white dark:bg-slate-900",
          SIZES[size] ?? SIZES.md,
          className
        )}
      >
        {/* Drag affordance for the mobile bottom-sheet presentation. */}
        <span className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />

        {!hideHeader && (title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-5 dark:border-slate-800">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {onClose && <IconButton icon={X} label="Close dialog" size="sm" onClick={onClose} />}
          </div>
        )}

        <div className={cx("min-h-0 flex-1 overflow-y-auto px-6 py-5", bodyClassName)}>{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Yes/no dialog for destructive actions. */
export function ConfirmDialog({
  open = true,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle size={18} className="text-rose-600" aria-hidden="true" />
        </span>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}
