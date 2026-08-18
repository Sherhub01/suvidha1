import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { cx, FIELD_TONE, FOCUS_RING } from "./tokens";

// ────────────────────────────────────────────────────────────
// Form controls
//
// Every control renders its own <label htmlFor>, wires aria-describedby to the
// hint or error, and sets aria-invalid — so a screen reader always announces
// what a field is and what is wrong with it.
//
// `tone="dark"` styles the control for the glassmorphism auth and admin sign-in
// screens. Those pages used to hand-roll a bare <label> next to an <input> with
// no association at all, which is what the accessibility warnings were about.
// ────────────────────────────────────────────────────────────

/** Label + control + hint/error wrapper shared by every control below. */
function FieldShell({ id, label, error, hint, required, tone, children, className = "" }) {
  const t = FIELD_TONE[tone] || FIELD_TONE.light;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cx("w-full", className)}>
      {label && (
        <label htmlFor={id} className={cx("mb-1.5 block text-xs font-semibold", t.label)}>
          {label}
          {required && (
            <span className="ml-0.5 text-rose-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children(describedBy, t)}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500"
        >
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cx("mt-1.5 text-xs", t.hint)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Text-style input. `type="password"` gets the show/hide toggle for free. */
export const Input = forwardRef(function Input(
  {
    label, error, hint, required, icon: Icon, tone = "light",
    className = "", wrapperClassName = "", type = "text", id, ...rest
  },
  ref
) {
  const reactId = useId();
  const fieldId = id || reactId;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      tone={tone}
      className={wrapperClassName}
    >
      {(describedBy, t) => (
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              aria-hidden="true"
              className={cx("pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2", t.icon)}
            />
          )}

          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cx(t.base, error ? t.error : t.normal, Icon && "pl-10", isPassword && "pr-11", className)}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className={cx("absolute right-3 top-1/2 -translate-y-1/2 rounded", t.toggle, FOCUS_RING)}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      )}
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, rows = 3, tone = "light", className = "", wrapperClassName = "", id, ...rest },
  ref
) {
  const reactId = useId();
  const fieldId = id || reactId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      tone={tone}
      className={wrapperClassName}
    >
      {(describedBy, t) => (
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(t.base, error ? t.error : t.normal, "resize-y", className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
});

/** `options` accepts strings or `{ value, label }` objects. */
export const Select = forwardRef(function Select(
  {
    label, error, hint, required, options = [], placeholder,
    tone = "light", className = "", wrapperClassName = "", children, id, ...rest
  },
  ref
) {
  const reactId = useId();
  const fieldId = id || reactId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      error={error}
      hint={hint}
      required={required}
      tone={tone}
      className={wrapperClassName}
    >
      {(describedBy, t) => (
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(t.base, error ? t.error : t.normal, "cursor-pointer", className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const text = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
          {children}
        </select>
      )}
    </FieldShell>
  );
});

export function Checkbox({ label, id, tone = "light", className = "", ...rest }) {
  const reactId = useId();
  const fieldId = id || reactId;
  const t = FIELD_TONE[tone] || FIELD_TONE.light;

  return (
    <label
      htmlFor={fieldId}
      className={cx("flex cursor-pointer items-center gap-2.5 text-sm", t.label, className)}
    >
      <input
        id={fieldId}
        type="checkbox"
        className={cx("h-4 w-4 rounded border-slate-300 text-indigo-600", FOCUS_RING)}
        {...rest}
      />
      {label}
    </label>
  );
}

/** Accessible on/off switch — used across all three Settings screens. */
export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <span className="min-w-0">
          {label && (
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
          )}
          {description && (
            <span className="block text-xs text-slate-400 dark:text-slate-500">{description}</span>
          )}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50",
          checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600",
          FOCUS_RING
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
