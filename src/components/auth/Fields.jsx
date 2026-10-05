import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, TriangleAlert } from "lucide-react";

const inputBase =
  "block w-full h-11 rounded-lg border border-slate-200 bg-white pl-3.5 text-sm text-navy-900 placeholder:text-slate-400 shadow-sm transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

export const Field = ({ label, htmlFor, aside, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-navy-900">{label}</label>
      {aside}
    </div>
    {children}
  </div>
);

// Text input (or select) with an optional trailing element.
export const TextInput = ({ trailing, className = "", as = "input", children, ...props }) => {
  const Tag = as;
  return (
    <div className="relative">
      <Tag className={`${inputBase} ${trailing || as === "select" ? "pr-10" : "pr-3.5"} ${className}`} {...props}>{children}</Tag>
      {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex">{trailing}</div>}
    </div>
  );
};

export const PasswordInput = (props) => {
  const [show, setShow] = useState(false);
  return (
    <TextInput
      type={show ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
};

export const SubmitButton = ({ loading, loadingText, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
  >
    {loading ? (
      <>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {loadingText}
      </>
    ) : (
      <>
        {children}
        <ArrowRight className="w-4 h-4" />
      </>
    )}
  </button>
);

export const ErrorBanner = ({ message }) =>
  message ? (
    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <TriangleAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  ) : null;
