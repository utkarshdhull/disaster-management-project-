import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AlertTriangleIcon, CheckCircleIcon, LocateIcon } from "./icons";

const API_URL = process.env.REACT_APP_API_URL || "";

function RequestForm() {
  const [name, setName] = useState("");
  const [need, setNeed] = useState("");
  const [severity, setSeverity] = useState(1);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const watchIdRef = useRef(null);

  const severityLabels = {
    1: { label: "Low", color: "text-emerald-400" },
    2: { label: "Moderate", color: "text-yellow-400" },
    3: { label: "High", color: "text-orange-400" },
    4: { label: "Critical", color: "text-red-400" },
    5: { label: "Extreme", color: "text-red-500" },
  };

  const geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
  };

  const applyPosition = (position) => {
    setLat(position.coords.latitude.toFixed(6));
    setLng(position.coords.longitude.toFixed(6));
    setAccuracy(position.coords.accuracy);
    setError("");
  };

  const getLocationError = (err) => {
    if (err?.code === 1) return "Location permission was denied. Allow location access in your browser and try again.";
    if (err?.code === 2) return "Your location is currently unavailable. Try moving near a window or enabling GPS/Wi-Fi.";
    if (err?.code === 3) return "Location lookup timed out. Please try again.";
    return "Unable to retrieve your location.";
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyPosition(position);
        setDetectingLocation(false);
      },
      (err) => {
        setError(getLocationError(err));
        setDetectingLocation(false);
      },
      geolocationOptions
    );
  };

  const stopTrackingLocation = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingLocation(false);
  };

  const toggleLiveTracking = () => {
    if (trackingLocation) {
      stopTrackingLocation();
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setTrackingLocation(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      applyPosition,
      (err) => {
        setError(getLocationError(err));
        stopTrackingLocation();
      },
      geolocationOptions
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_URL}/api/request-help`, {
        name,
        need,
        severity: Number(severity),
        location: {
          lat: Number(lat),
          lng: Number(lng),
          accuracy: accuracy ? Math.round(accuracy) : undefined,
        },
      });

      setSuccess("Help request submitted successfully!");
      setName("");
      setNeed("");
      setSeverity(1);
      setLat("");
      setLng("");
      setAccuracy(null);
      stopTrackingLocation();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-slide-down">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="request-name" className="form-label">
            Your Name
          </label>
          <input
            id="request-name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="request-need" className="form-label">
            What do you need?
          </label>
          <input
            id="request-need"
            placeholder="e.g. Medical aid, food, shelter..."
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="request-severity" className="form-label">
            Severity Level
          </label>
          <div className="flex items-center gap-4">
            <input
              id="request-severity"
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer dark:bg-white/10
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
                         [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
            />
            <span
              className={`text-sm font-bold min-w-[70px] text-right ${
                severityLabels[severity]?.color || "text-gray-400"
              }`}
            >
              {severity} — {severityLabels[severity]?.label || ""}
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="form-label !mb-0">Location</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleLiveTracking}
                className={`text-xs font-medium transition-colors flex items-center gap-1 ${
                  trackingLocation
                    ? "text-emerald-500 hover:text-emerald-400"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${trackingLocation ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
                {trackingLocation ? "Tracking" : "Track live"}
              </button>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors flex items-center gap-1"
              >
                {detectingLocation ? (
                  <>
                    <span className="spinner !w-3 !h-3 !border-brand-400 !border-t-brand-200" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <LocateIcon className="w-3.5 h-3.5" />
                    Auto-detect
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              id="request-lat"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="input-field"
              required
            />
            <input
              id="request-lng"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="input-field"
              required
            />
          </div>
          {accuracy !== null && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs text-brand-700 dark:text-brand-300">
              <span>GPS accuracy</span>
              <strong>±{Math.round(accuracy)} m</strong>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          id="submit-request"
        >
          {loading ? (
            <>
              <span className="spinner" />
              Submitting...
            </>
          ) : (
            <>
              <AlertTriangleIcon className="w-4 h-4" />
              Send Help Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default RequestForm;
