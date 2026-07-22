import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRefreshToken, isTokenExpired, setSession, clearSession } from "../utilis/storage";
import api from "../utilis/api";

/**
 * Wraps protected routes. On first render it verifies the session with the
 * backend — handles the case where the token was tampered with or the user
 * was deleted. Subsequent navigations inside the dashboard skip the check.
 */
const PrivateRoute = ({ children }) => {
  const token = getToken();
  const refreshToken = getRefreshToken();

  // No credentials at all → go to login immediately
  if (!token && !refreshToken) return <Navigate to="/login" replace />;

  const [state, setState] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        // If the access token is still valid we can skip the network call
        if (!isTokenExpired()) {
          if (!cancelled) setState("ok");
          return;
        }
        // Token expired — let the axios interceptor attempt a refresh via /auth/me
        // (the response interceptor will rotate the token before this resolves)
        await api.get("/auth/me");
        if (!cancelled) setState("ok");
      } catch {
        clearSession();
        if (!cancelled) setState("denied");
      }
    };

    verify();
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

  if (state === "denied") return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
