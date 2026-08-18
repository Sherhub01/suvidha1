import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cx, FOCUS_RING } from "./tokens";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap " +
  "transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 " +
  `rounded-xl ${FOCUS_RING}`;

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600",
  outline:
    "border border-indigo-200 bg-transparent text-indigo-600 hover:bg-indigo-50",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  subtle: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
};

const SIZES = {
  xs: "px-2.5 py-1 text-[11px]",
  sm: "px-3.5 py-2 text-xs",
  md: "px-4.5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const ICON_SIZES = { xs: 12, sm: 14, md: 16, lg: 18 };

/**
 * The single button used across consumer, staff and admin panels.
 *
 * Renders a <button> by default, a react-router <Link> when `to` is given, or
 * an <a> when `href` is given — so navigation and actions share one look.
 *
 * While `loading` is true the button is disabled and shows a spinner in place
 * of the leading icon, which keeps the label from shifting.
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    className = "",
    to,
    href,
    ...rest
  },
  ref
) {
  const iconSize = ICON_SIZES[size] ?? 16;
  const classes = cx(
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon size={iconSize} aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;

/** Square icon-only button. `label` is required — it becomes the accessible name. */
export function IconButton({
  icon: Icon,
  label,
  size = "md",
  variant = "ghost",
  className = "",
  ...rest
}) {
  const box = { xs: "h-7 w-7", sm: "h-8 w-8", md: "h-10 w-10", lg: "h-11 w-11" }[size] ?? "h-10 w-10";

  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={cx(box, "px-0!", className)}
      {...rest}
    >
      <Icon size={ICON_SIZES[size] ?? 16} aria-hidden="true" />
    </Button>
  );
}
