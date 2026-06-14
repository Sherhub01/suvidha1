import { useState, useEffect } from "react";

/**
 * useGeolocation
 * Wraps the browser Geolocation API. Returns the user's coordinates,
 * a loading flag, and any error message — used to power the
 * "Nearby Professionals" section and Settings > Manage Location.
 */
export default function useGeolocation({ watch = false } = {}) {
  const [state, setState] = useState({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ coords: null, loading: false, error: "Geolocation is not supported on this device." });
      return;
    }

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
  }, [watch]);

  return state;
}
