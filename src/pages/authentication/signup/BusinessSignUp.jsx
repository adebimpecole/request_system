import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utilis/api";
import { generateRandomCode } from "../../../utilis/functions";
import { setSession } from "../../../utilis/storage";

const BrandPanel = () => (
  <div className="hidden lg:flex lg:w-5/12 bg-hero-gradient flex-col justify-between p-12 relative overflow-hidden">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #818cf8 0%, transparent 50%)" }} />
    <div className="relative">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="font-bold text-xl text-white">FinReq</span>
      </Link>
    </div>
    <div className="relative space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">Set up your organization in minutes</h2>
        <p className="text-white/60 leading-relaxed">Create your business account, configure approval workflows, and start managing financial requests today.</p>
      </div>
      {[
        "Full organizational control",
        "Custom approval workflows",
        "Spending analytics & reports",
        "Unlimited team members",
      ].map((text) => (
        <div key={text} className="flex items-center gap-3 w-fit">
          <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-blue-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-white/80 text-sm font-medium">{text}</span>
        </div>
      ))}
    </div>
    <div className="relative text-white/30 text-xs">© {new Date().getFullYear()} FinReq</div>
  </div>
);

const BusinessSignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "", email: "", password: "", confirm: "", company_code: "",
  });

  const { company_name, email, password, confirm } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const updatedFormData = { ...formData, company_code: generateRandomCode(6) };
      const res = await api.post("/auth/company_register", updatedFormData);
      setSession({ user: res.data.user, token: res.data.token, refreshToken: res.data.refreshToken });
      navigate("/setup");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <BrandPanel />
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">FinReq</span>
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto">
          <div className="mb-8">
            <Link to="/pickuser" className="flex items-center gap-1.5 text-sm mr-auto -ml-[20px] text-slate-500 hover:text-slate-700 transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="flex items-center">
              <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 mb-4 mx-auto">
                <span className="text-[11px] font-semibold text-brand-600">Business Account</span>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Create your organization</h1>
            <p className="text-slate-500 text-center">Set up your company workspace and start managing requisitions.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex flex-col items-start">
              <label htmlFor="company_name" className="label">Company Name</label>
              <input id="company_name" name="company_name" type="text" required className="input-field" placeholder="Acme Corporation" value={company_name} onChange={onChange} />
            </div>

            <div className="flex flex-col items-start">
              <label htmlFor="email" className="label">Work Email</label>
              <input id="email" name="email" type="email" required className="input-field" placeholder="admin@company.com" value={email} onChange={onChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <label htmlFor="password" className="label">Password</label>
                <div className="relative w-full">
                  <input id="password" name="password" type={showPass ? "text" : "password"} required className="input-field pr-11" placeholder="Min 8 characters" value={password} onChange={onChange} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={showPass ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <label htmlFor="confirm" className="label">Confirm Password</label>
                <input id="confirm" name="confirm" type={showPass ? "text" : "password"} required className="input-field" placeholder="Repeat password" value={confirm} onChange={onChange} />
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <svg className="w-3 h-3 text-brand-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-[11px] text-brand-700 text-left">A unique company code will be generated automatically. Share it with employees to invite them to your workspace.</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating account...
                </span>
              ) : "Create Business Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessSignUp;
