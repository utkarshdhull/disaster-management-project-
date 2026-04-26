import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClipboardListIcon,
} from "./icons";

const API_URL = process.env.REACT_APP_API_URL || "";

function DashboardStats() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axios.get(`${API_URL}/api/all-requests`, {
        params: { userId: user._id }
      });
      setRequests(res.data);
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

  const pending = requests.filter((request) => request.status !== "resolved");
  const resolved = requests.filter((request) => request.status === "resolved");
  const critical = pending.filter((request) => request.severity >= 4);
  const averageSeverity = requests.length
    ? (
        requests.reduce((total, request) => total + Number(request.severity || 0), 0) /
        requests.length
      ).toFixed(1)
    : "0.0";

  const stats = [
    {
      label: "Active Requests",
      value: pending.length,
      detail: `${requests.length} total logged`,
      icon: ClipboardListIcon,
      tone: "text-brand-600 bg-brand-500/10 border-brand-500/20",
    },
    {
      label: "Critical Cases",
      value: critical.length,
      detail: "Severity 4 and above",
      icon: AlertTriangleIcon,
      tone: "text-red-600 bg-red-500/10 border-red-500/20",
    },
    {
      label: "Resolved",
      value: resolved.length,
      detail: "Closed by responders",
      icon: CheckCircleIcon,
      tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Avg Severity",
      value: averageSeverity,
      detail: "Across all reports",
      icon: ActivityIcon,
      tone: "text-violet-600 bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      {stats.map((stat) => {
        const StatIcon = stat.icon;

        return (
          <div key={stat.label} className="stat-card">
            <div className={`stat-icon ${stat.tone}`}>
              <StatIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-950 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.detail}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardStats;
