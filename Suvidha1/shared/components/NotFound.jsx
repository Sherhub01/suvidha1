import { useNavigate } from "react-router-dom";
import { Compass, ArrowLeft, Home } from "lucide-react";
import Button from "../ui/Button";

/** Shown for any URL that does not match a route. */
export default function NotFound({ homePath = "/" }) {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-6 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Compass size={28} className="text-indigo-600" aria-hidden="true" />
      </span>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">404</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          The page you are looking for was moved, removed, or never existed.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button icon={Home} to={homePath}>
          Home
        </Button>
      </div>
    </main>
  );
}
