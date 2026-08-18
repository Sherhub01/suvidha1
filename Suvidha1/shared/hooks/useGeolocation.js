import { useState, useEffect } from "react";

/**
 * useGeolocation
 * Wraps the browser Geolocation API. Returns the user's coordinates,
 * a loading flag, and any error message — used to power the
 * "Nearby Professionals" section and Settings > Manage Location.
 */
export default function useGeolocation({ watch = false } = {}) {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;

  // Support is known at first render, so it seeds the initial state instead of
  // being written back from an effect.
  const [state, setState] = useState(() => ({
    coords: null,
    loading: supported,
    error: supported ? null : "Geolocation is not supported on this device.",
  }));

  useEffect(() => {
    if (!supported) return undefined;

    const onSuccess = (position) => {
      setState({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        loading: false,
        error: null,
      });
    };

    const onError = (err) => {
      setState({ coords: null, loading: false, error: err.message });
    };

    const options = { enableHighAccuracy: true, timeout: 10000 };

    if (watch) {
      const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
      return () => navigator.geolocation.clearWatch(id);
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    return undefined;
  }, [watch, supported]);

  return state;
}
