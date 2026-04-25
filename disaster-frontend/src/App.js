import React, { useEffect, useState } from "react";
import RequestForm from "./RequestForm";
import RequestList from "./RequestList";
import MapView from "./MapView";
import Login from "./login";
import Register from "./Register";
import DashboardStats from "./DashboardStats";
import {
  AlertTriangleIcon,
  LogOutIcon,
  MoonIcon,
  RadioIcon,
  ShieldCheckIcon,
  SunIcon,
  UserCircleIcon,
} from "./icons";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  // 🔐 LOGIN / REGISTER SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4 text-brand-200">
              <AlertTriangleIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Smart Disaster Response
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Real-time coordination for emergency management
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-strong p-8">
            {showRegister ? (
              <Register onSuccess={handleRegisterSuccess} />
            ) : (
              <Login onSuccess={handleLoginSuccess} />
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRegister(!showRegister)}
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors duration-200"
              >
                {showRegister
                  ? "← Back to Login"
                  : "Don't have an account? Register"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Secure Emergency Response Platform
          </p>
        </div>
      </div>
    );
  }

  // ✅ DASHBOARD
  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-surface-50 text-gray-900 transition-colors duration-500 dark:bg-surface-800 dark:text-gray-100">
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm transition-colors duration-500 dark:border-white/[0.06] dark:bg-surface-900/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-600 dark:text-brand-300">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-950 leading-tight dark:text-white">
                    Disaster Dashboard
                  </h2>
                  <p className="text-[11px] text-gray-500 leading-none dark:text-gray-400">
                    Response Coordination
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/[0.06] dark:border-white/[0.08]">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white">
                    <UserCircleIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium dark:text-gray-300">
                    {user?.name || "User"}
                  </span>
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="btn-ghost !px-3 !py-2 text-sm"
                  id="dark-mode-toggle"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                </button>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="btn-danger text-sm inline-flex items-center gap-2"
                  id="logout-button"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* STATS BAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="notification-dot bg-emerald-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">System Active</span>
            <span className="text-xs text-gray-300 ml-2 dark:text-gray-600">•</span>
            <span className="text-xs text-gray-500 ml-1 inline-flex items-center gap-1">
              <RadioIcon className="w-3.5 h-3.5" />
              Real-time updates enabled
            </span>
          </div>

          <DashboardStats />

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* FORM */}
            <div className="glass p-6 animate-slide-up stagger-1">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangleIcon className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Request Help
                </h3>
              </div>
              <RequestForm />
            </div>

            {/* LIST */}
            <div className="lg:col-span-2 glass p-6 animate-slide-up stagger-2">
              <RequestList />
            </div>

            {/* MAP */}
            <div className="lg:col-span-3 glass p-6 animate-slide-up stagger-3">
              <MapView darkMode={darkMode} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-8 border-t border-gray-200 py-6 dark:border-white/[0.06]">
          <p className="text-center text-gray-500 text-xs dark:text-gray-500">
            Smart Disaster Response Coordination System &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
