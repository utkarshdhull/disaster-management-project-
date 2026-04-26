import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  FilterIcon,
  MapPinIcon,
  SearchIcon,
  SlidersIcon,
} from "./icons";

const API_URL = process.env.REACT_APP_API_URL || "";

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, resolved
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 🔥 Fetch all requests
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

  // 🔥 Resolve request
  const resolveRequest = async (id) => {
    try {
      await axios.put(`${API_URL}/api/resolve/${id}`);
      fetchRequests();
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

  const filteredRequests = requests.filter((req) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      req.name?.toLowerCase().includes(query) ||
      req.need?.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (criticalOnly && Number(req.severity) < 4) return false;
    if (filter === "pending") return req.status !== "resolved";
    if (filter === "resolved") return req.status === "resolved";
    return true;
  }).sort((a, b) => {
    if (sortBy === "severity") return Number(b.severity || 0) - Number(a.severity || 0);
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    return Number(b.priority || 0) - Number(a.priority || 0);
  });

  const pendingCount = requests.filter((r) => r.status !== "resolved").length;
  const resolvedCount = requests.filter((r) => r.status === "resolved").length;

  const getSeverityBadge = (severity) => {
    if (severity >= 4) {
      return {
        class: "severity-critical",
        label: "Critical",
        accent: "!border-l-red-500",
        glow: "hover:shadow-red-500/10",
      };
    }
    if (severity >= 3) {
      return {
        class: "severity-high",
        label: "High",
        accent: "!border-l-orange-500",
        glow: "hover:shadow-orange-500/10",
      };
    }
    if (severity >= 2) {
      return {
        class: "severity-medium",
        label: "Medium",
        accent: "!border-l-yellow-500",
        glow: "hover:shadow-yellow-500/10",
      };
    }
    return {
      class: "severity-low",
      label: "Low",
      accent: "!border-l-emerald-500",
      glow: "hover:shadow-emerald-500/10",
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
            Active Requests
          </h3>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold">
            {requests.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 dark:bg-white/[0.04] dark:border-white/[0.06]">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "resolved", label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === tab.key
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="toolbar-input pl-9"
            placeholder="Search by name or need"
          />
        </label>

        <div className="flex gap-2">
          <label className="relative">
            <SlidersIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="select-field pl-9"
              aria-label="Sort requests"
            >
              <option value="priority">Priority</option>
              <option value="severity">Severity</option>
              <option value="name">Name</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setCriticalOnly((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              criticalOnly
                ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-gray-200 bg-white text-gray-600 hover:text-gray-950 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-gray-300"
            }`}
          >
            <FilterIcon className="w-4 h-4" />
            Critical
          </button>
        </div>

        <div className="flex items-center justify-start rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-gray-400">
          Updated {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
        </div>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <ClipboardListIcon className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 text-sm dark:text-gray-400">No requests found</p>
          <p className="text-gray-400 text-xs mt-1 dark:text-gray-500">
            {filter !== "all"
              ? "Try changing the filter"
              : "New requests will appear here in real-time"}
          </p>
        </div>
      )}

      {/* Request Cards */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredRequests.map((req, index) => {
          const severityInfo = getSeverityBadge(req.severity);

          return (
            <div
              key={req._id}
              className={`card-hover-glow border-l-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm
                         hover:bg-gray-50 hover:border-gray-300
                         dark:bg-white/[0.04] dark:border-white/[0.06]
                         dark:hover:bg-white/[0.06] dark:hover:border-white/[0.1]
                         transition-all duration-300 animate-fade-in ${severityInfo.accent} ${severityInfo.glow}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-gray-950 text-sm dark:text-white">
                      {req.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${severityInfo.class}`}
                    >
                      {severityInfo.label}
                    </span>
                    <span
                      className={
                        req.status === "resolved"
                          ? "status-resolved"
                          : "status-pending"
                      }
                    >
                      {req.status === "resolved" ? (
                        <CheckCircleIcon className="w-3 h-3" />
                      ) : (
                        <AlertTriangleIcon className="w-3 h-3" />
                      )}
                      {req.status}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm mb-2 dark:text-gray-300">
                    <span className="text-gray-500">Need:</span> {req.need}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Severity: <strong className="text-gray-700 dark:text-gray-300">{req.severity}/5</strong>
                    </span>
                    <span>
                      Priority:{" "}
                      <strong className="text-brand-400">{req.priority}</strong>
                    </span>
                    {req.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        {req.location.lat?.toFixed(2)}, {req.location.lng?.toFixed(2)}
                        {req.location.accuracy ? ` · ±${Math.round(req.location.accuracy)}m` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resolve Button */}
                {req.status !== "resolved" && (
                  <button
                    onClick={() => resolveRequest(req._id)}
                    className="btn-success text-xs whitespace-nowrap inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RequestList;
