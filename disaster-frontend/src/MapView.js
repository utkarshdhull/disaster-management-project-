import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  LayersIcon,
  LocateIcon,
  MapIcon,
  RadioIcon,
  TargetIcon,
} from "./icons";

const API_URL = process.env.REACT_APP_API_URL || "";

// 🔥 Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// 🔥 Colored icons
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function FitMapToPoints({ points, userLocation, fitNonce }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = points
      .map((request) => [request.location.lat, request.location.lng])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

    if (userLocation) {
      coordinates.push([userLocation.lat, userLocation.lng]);
    }

    if (!coordinates.length) return;

    if (coordinates.length === 1) {
      map.flyTo(coordinates[0], 13, { duration: 0.8 });
      return;
    }

    map.fitBounds(L.latLngBounds(coordinates), {
      padding: [36, 36],
      maxZoom: 13,
    });
  }, [fitNonce, map, points, userLocation]);

  return null;
}

function MapView({ darkMode }) {
  const [requests, setRequests] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [fitNonce, setFitNonce] = useState(0);
  const [mapError, setMapError] = useState("");

  const fetchRequests = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axios.get(`${API_URL}/api/all-requests`, {
        params: { userId: user._id }
      });
      setRequests(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();

    const socket = io(API_URL);

    socket.on("newRequest", (newReq) => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (newReq.userId === user._id) {
          fetchRequests();
        }
      }
    });

    return () => socket.disconnect();
  }, []);

  const activeRequests = requests.filter((r) => r.status !== "resolved");
  const visibleRequests = useMemo(() => {
    const source = showActiveOnly ? activeRequests : requests;

    return source.filter((request) => {
      const lat = Number(request.location?.lat);
      const lng = Number(request.location?.lng);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [activeRequests, requests, showActiveOnly]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setMapError("Location is not supported by this browser.");
      return;
    }

    setLocatingUser(true);
    setMapError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setFitNonce((value) => value + 1);
        setLocatingUser(false);
      },
      () => {
        setMapError("Could not access your current location.");
        setLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Disaster Map</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <button
            type="button"
            onClick={() => setShowActiveOnly((value) => !value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-medium transition-colors ${
              showActiveOnly
                ? "border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-300"
                : "border-gray-200 bg-white text-gray-500 dark:border-white/[0.1] dark:bg-white/[0.05]"
            }`}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            {showActiveOnly ? "Active only" : "All reports"}
          </button>
          <button
            type="button"
            onClick={() => setFitNonce((value) => value + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 font-medium text-gray-500 transition-colors hover:text-gray-900 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white"
          >
            <TargetIcon className="w-3.5 h-3.5" />
            Fit map
          </button>
          <button
            type="button"
            onClick={locateUser}
            disabled={locatingUser}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-1 font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-60 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-400 dark:hover:text-white"
          >
            {locatingUser ? (
              <span className="spinner !h-3 !w-3 !border-gray-400 !border-t-brand-500" />
            ) : (
              <LocateIcon className="w-3.5 h-3.5" />
            )}
            My location
          </button>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Low
          </span>
          <span className="text-gray-500 ml-1 dark:text-gray-600">
            {visibleRequests.length} shown
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-gray-500 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-gray-400">
            <RadioIcon className="w-3.5 h-3.5" />
            {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
          </span>
        </div>
      </div>

      {activeRequests.some((request) => request.severity >= 4) && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertTriangleIcon className="h-4 w-4" />
          Critical requests are currently active on the map
        </div>
      )}

      {mapError && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          <AlertTriangleIcon className="h-4 w-4" />
          {mapError}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.06]" style={{ height: "450px" }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <FitMapToPoints points={visibleRequests} userLocation={userLocation} fitNonce={fitNonce} />
          <TileLayer
            key={darkMode ? "dark-map" : "light-map"}
            attribution="&copy; OpenStreetMap contributors"
            url={
              darkMode
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {userLocation && (
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={12}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.22,
                weight: 2,
              }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>Your current location</strong>
                  <br />
                  <span>Accuracy:</span> ±{Math.round(userLocation.accuracy || 0)}m
                </div>
              </Popup>
            </CircleMarker>
          )}

          {visibleRequests.map((req) => (
            <Marker
              key={req._id}
              position={[req.location.lat, req.location.lng]}
              icon={
                req.severity >= 4
                  ? redIcon
                  : req.severity >= 2
                  ? yellowIcon
                  : greenIcon
              }
            >
              <Popup>
                <div className="map-popup" style={{ color: darkMode ? "#e2e8f0" : "#1f2937" }}>
                  <strong style={{ fontSize: "14px" }}>{req.name}</strong>
                  <br />
                  <span style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>Need:</span> {req.need}
                  <br />
                  <span style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>Severity:</span>{" "}
                  <strong
                    style={{
                      color:
                        req.severity >= 4
                          ? "#f87171"
                          : req.severity >= 2
                          ? "#fbbf24"
                          : "#34d399",
                    }}
                  >
                    {req.severity}/5
                  </strong>
                  <br />
                  <span style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>Status:</span>{" "}
                  <strong
                    style={{
                      color:
                        req.status === "resolved" ? "#34d399" : "#fbbf24",
                    }}
                  >
                    {req.status}
                  </strong>
                  {req.location?.accuracy && (
                    <>
                      <br />
                      <span style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>GPS accuracy:</span>{" "}
                      ±{Math.round(req.location.accuracy)}m
                    </>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${req.location.lat},${req.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
                  >
                    Open in Google Maps
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;
