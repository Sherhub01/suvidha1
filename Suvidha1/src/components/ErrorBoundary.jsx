import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "./ui/Button";

/**
 * Catches render-time errors so one broken component shows a recovery panel
 * instead of blanking the whole app.
 *
 * Class component by necessity — React has no hook equivalent for
 * componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Replace with your error reporter (Sentry, etc.) when one is wired up.
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (!error) return children;
    if (fallback) return fallback(error, this.handleRetry);

    return (
      <div
        role="alert"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
          <AlertTriangle size={28} className="text-rose-600" aria-hidden="true" />
        </span>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            This page hit an unexpected error. Try again, or head back to your dashboard.
          </p>
        </div>

        {import.meta.env.DEV && (
          <pre className="max-w-xl overflow-x-auto rounded-xl bg-slate-900 px-4 py-3 text-left text-[11px] text-rose-300">
            {error.message}
          </pre>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          <Button icon={RefreshCw} onClick={this.handleRetry}>
            Try again
          </Button>
          <Button variant="secondary" icon={Home} onClick={() => window.location.assign("/")}>
            Go home
          </Button>
        </div>
      </div>
    );
  }
}
