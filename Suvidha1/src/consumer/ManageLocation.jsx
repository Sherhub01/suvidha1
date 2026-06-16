import { useState } from "react";
import { MapPin, Compass, CheckCircle2, Loader2, Navigation } from "lucide-react";
import { THEME, MOCK_USER, updateLocation } from "../api";

const CITIES = [
  "New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad",
  "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad",
];

const ManageLocation = () => {
  const [address, setAddress] = useState({ ...MOCK_USER.address });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        // Simulate reverse geocode
        setAddress((prev) => ({
          ...prev,
          city: "New Delhi",
          state: "Delhi",
          fullAddress: `Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        }));
        setLocating(false);
      },
      (err) => {
        setLocError(err.message || "Unable to retrieve your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateLocation({ address, ...(coords ? { lat: coords.lat, lng: coords.lng } : {}) });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (field) => (e) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSave} className="flex max-w-lg flex-col gap-6">
      {/* Detect button */}
      <div className={`${THEME.card} p-5`}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Navigation size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Use my current location</p>
            <p className="text-xs text-gray-500">We'll use GPS to find your coordinates and fill the form below.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className={`${THEME.secondaryBtn} mt-4 w-full`}
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
          {locating ? "Locating..." : "Detect my location"}
        </button>
        {locError && <p className={`${THEME.errorAlert} mt-3`}>{locError}</p>}
        {coords && (
          <p className={`${THEME.successAlert} mt-3 flex items-center gap-2`}>
            <CheckCircle2 size={15} />
            Location detected: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
          </p>
        )}
      </div>

      {/* Manual address form */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
          Saved default address
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">City</span>
            <select value={address.city} onChange={set("city")} className={THEME.input}>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">State</span>
            <input
              type="text"
              value={address.state}
              onChange={set("state")}
              className={THEME.input}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">PIN code</span>
            <input
              type="text"
              value={address.pinCode}
              onChange={set("pinCode")}
              maxLength={6}
              className={THEME.input}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Full address</span>
            <textarea
              rows={2}
              value={address.fullAddress}
              onChange={set("fullAddress")}
              className={`${THEME.input} resize-none`}
            />
          </label>
        </div>
      </div>

      {saved && (
        <p className={`${THEME.successAlert} flex items-center gap-2`}>
          <CheckCircle2 size={15} /> Location saved successfully!
        </p>
      )}

      <div>
        <button type="submit" disabled={saving} className={THEME.primaryBtn}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {saving ? "Saving..." : "Save location"}
        </button>
      </div>
    </form>
  );
};

export default ManageLocation;
