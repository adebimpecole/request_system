import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utilis/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot_password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6ee7b7 0%, transparent 50%)" }} />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white">FinReq</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Locked out?<br />We'll get you back in.
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Enter the email on your account and we'll send you a link to choose a new password.
          </p>
        </div>
        <div className="relative text-white/30 text-xs">© {new Date().getFullYear()} FinReq</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">FinReq</span>
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto">
          {sent ? (
            <>
              <div className="mb-6 w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Check your email</h1>
              <p className="text-slate-500 mb-8">
                If an account exists for <span className="font-semibold text-slate-700">{email}</span>, we've sent a link to reset your password. It expires in 1 hour.
              </p>
              <Link to="/login" className="btn-primary w-full inline-flex items-center justify-center">Back to sign in</Link>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Forgot your password?</h1>
                <p className="text-slate-500">Enter your email and we'll send you a link to reset it.</p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="label">Email address</label>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    className="input-field"
                    placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-primary py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending link...
                    </span>
                  ) : "Send reset link"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Remembered your password?{" "}
                <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
