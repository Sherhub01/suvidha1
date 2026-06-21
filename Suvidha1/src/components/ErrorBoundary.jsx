import React from "react";
import { AlertCircle } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-96 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-3 text-red-600" size={32} />
            <h2 className="mb-2 font-semibold text-red-900">Something went wrong</h2>
            <p className="text-sm text-red-700">
              {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
