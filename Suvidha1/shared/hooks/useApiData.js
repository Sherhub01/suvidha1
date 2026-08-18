import { useCallback, useEffect, useReducer, useRef } from "react";
import { errorMessage } from "../services/http";

// ────────────────────────────────────────────────────────────
// useApiData
//
// Replaces the load / loading / error / useEffect / setInterval block that was
// copied into roughly fifteen screens.
//
// State lives in a reducer so a fetch cycle is one dispatch rather than three
// separate setState calls, and every update happens in the async continuation
// — never synchronously inside the effect body.
//
// Polling pauses while the tab is hidden, which removes a lot of pointless
// traffic from a dashboard left open in a background tab.
// ────────────────────────────────────────────────────────────

const init = (initial) => ({
  data: initial,
  loading: false,
  error: "",
  lastUpdated: null,
});

function reducer(state, action) {
  switch (action.type) {
    case "start":
      return state.loading ? state : { ...state, loading: true };
    case "success":
      return { data: action.data, loading: false, error: "", lastUpdated: action.at };
    case "failure":
      return { ...state, loading: false, error: action.error };
    case "set":
      return {
        ...state,
        data: typeof action.data === "function" ? action.data(state.data) : action.data,
      };
    case "idle":
      return state.loading ? { ...state, loading: false } : state;
    default:
      return state;
  }
}

/**
 * @param {Function} fetcher  async ({ signal }) => data. Wrap it in useCallback
 *                            so it stays stable across renders.
 * @param {object}   options
 * @param {number}   options.pollMs   refresh interval in ms; 0 disables polling
 * @param {any}      options.initial  initial value for `data`
 * @param {boolean}  options.enabled  skip fetching entirely when false
 */
export default function useApiData(fetcher, options = {}) {
  const { pollMs = 0, initial = null, enabled = true } = options;

  const [state, dispatch] = useReducer(reducer, initial, init);

  // Refs are only ever written from effects/callbacks, never during render.
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async ({ silent = false, signal } = {}) => {
      if (!silent) dispatch({ type: "start" });

      try {
        const data = await fetcherRef.current({ signal });
        if (!mountedRef.current || signal?.aborted) return undefined;

        dispatch({ type: "success", data, at: new Date() });
        return data;
      } catch (err) {
        if (!mountedRef.current || signal?.aborted || err?.name === "CanceledError") return undefined;
        dispatch({ type: "failure", error: errorMessage(err) });
        return undefined;
      }
    },
    []
  );

  // Initial load. Nothing is dispatched synchronously here — `run` is async, so
  // the first state change lands in a later tick.
  useEffect(() => {
    if (!enabled) {
      dispatch({ type: "idle" });
      return undefined;
    }

    const controller = new AbortController();
    run({ signal: controller.signal });

    return () => controller.abort();
  }, [run, enabled, fetcher]);

  // Background refresh.
  useEffect(() => {
    if (!enabled || !pollMs) return undefined;

    const tick = () => {
      if (document.visibilityState === "visible") run({ silent: true });
    };

    const id = setInterval(tick, pollMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [run, pollMs, enabled]);

  const setData = useCallback((data) => dispatch({ type: "set", data }), []);
  const reload = useCallback(() => run(), [run]);
  const refresh = useCallback(() => run({ silent: true }), [run]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    setData,
    /** Re-fetch, showing the loading state. */
    reload,
    /** Re-fetch quietly — for background refreshes. */
    refresh,
  };
}
