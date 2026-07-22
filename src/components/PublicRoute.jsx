import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRefreshToken, isTokenExpired } from "../utilis/storage";
import api from "../utilis/api";

/**
 * Wraps public-only routes (login, signup, etc.).
 * If the user already has a valid session they are redirected to the dashboard
 * instead of seeing the auth form.
 */
const PublicRoute = ({ children }) => {
  const token = getToken();
  const refreshToken = getRefreshToken();

  // No credentials → show the public page immediately
  if (!token && !refreshToken) return children;

  const [state, setState] = useState("checking"); // "checking" | "pass" | "redirect"

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      // Access token still valid — redirect right away without a network call
      if (!isTokenExpired()) {
        if (!cancelled) setState("redirect");
        return;
      }

      // Token expired but refresh token present — try to silently refresh
      try {
        await api.get("/auth/me"); // interceptor will rotate token if expired
        if (!cancelled) setState("redirect");
      } catch {
        // Refresh also failed — session is dead, show the public page
        if (!cancelled) setState("pass");
      }
    };

    check();
    return () => { cancelled = true; };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="w-7 h-7 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (state === "redirect") return <Navigate to="/employeedashboard" replace />;

  return children;
};

export default PublicRoute;
