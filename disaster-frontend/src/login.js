import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";

function Login({ onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        form
      );

      if (onSuccess) {
        onSuccess(res.data.user);
      } else {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
      <p className="text-gray-400 text-sm mb-6">
        Sign in to access the dashboard
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="form-label">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          id="login-submit"
        >
          {loading ? (
            <>
              <span className="spinner" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;