// Building blocks shared by the dashboard list pages (Requests, Team, Activity
// Log) and the request screens, so they all read as one design.
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownRight, ArrowUpRight, ChevronDown, EllipsisVertical, Minus } from "lucide-react";

export const Spinner = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin ${/\btext-/.test(className) ? "" : "text-brand-500"}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export const Card = ({ className = "", children }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 ${className}`}>{children}</div>
);

export const PageHeader = ({ eyebrow, title, desc, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      {eyebrow && <p className="text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">{eyebrow}</p>}
      <h1 className="text-[28px] font-extrabold text-navy-900 tracking-tight leading-tight">{title}</h1>
      {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const PrimaryButton = ({ icon: Icon, children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

export const SecondaryButton = ({ icon: Icon, children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

const statTones = {
  brand: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
};

// The one stat card used across the app: label + icon, a big number, and a
// footer line with context. `trend` is a % change (null = no earlier data);
// `invert` marks metrics where going up is bad (e.g. rejections).
export const StatCard = ({ label, value, icon: Icon, tone = "brand", sub, trend, invert = false }) => {
  const hasTrend = trend !== undefined;
  const Arrow = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 truncate">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statTones[tone]}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-navy-900 tabular-nums">{value}</p>
      {(sub || hasTrend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs min-w-0">
          {hasTrend && (
            <span className={`inline-flex items-center gap-0.5 font-semibold rounded-md px-1.5 py-0.5 flex-shrink-0 ${
              trend === null || trend === 0 ? "bg-slate-100 text-slate-500" : (trend > 0) !== invert ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}>
              <Arrow className="w-3.5 h-3.5" />{trend === null ? "New" : `${Math.abs(trend)}%`}
            </span>
          )}
          {sub && <span className="text-slate-500 truncate">{sub}</span>}
        </div>
      )}
    </div>
  );
};

export const StatGrid = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    {items.map((s) => <StatCard key={s.label} {...s} />)}
  </div>
);

// "38%" of a total, or an em dash when there's nothing to divide by
export const pct = (part, whole) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—");

// Pill tabs ("All · Pending · Approved …"). Each option: { key, label, count? }.
export const FilterPills = ({ options, value, onChange }) => (
  <div className="flex items-center gap-1 overflow-x-auto max-w-full" role="tablist">
    {options.map((o) => {
      const active = value === o.key;
      return (
        <button
          key={o.key}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(o.key)}
          className={`flex-shrink-0 whitespace-nowrap h-8 px-3.5 rounded-full text-xs font-semibold transition-colors ${
            active ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:text-navy-900 hover:bg-slate-100"
          }`}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={`ml-1.5 ${active ? "text-white/80" : o.highlight && o.count > 0 ? "text-amber-600" : "text-slate-400"}`}>{o.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

// Styled native select with an optional leading icon.
export const SelectField = ({ icon: Icon, value, onChange, options, label, className = "" }) => (
  <div className={`relative ${className}`}>
    {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none bg-none w-full h-9 rounded-lg border border-slate-200 bg-white ${Icon ? "pl-9" : "pl-3"} pr-9 text-xs font-medium text-slate-700 capitalize focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  </div>
);

export const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="p-12 text-center">
    <span className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Icon className="w-7 h-7 text-slate-400" />
    </span>
    <p className="font-semibold text-navy-900 mb-1">{title}</p>
    {desc && <p className="text-sm text-slate-400">{desc}</p>}
  </div>
);

export const STATUS = {
  approved: { cls: "status-approved", label: "Approved" },
  rejected: { cls: "status-rejected", label: "Rejected" },
  closed: { cls: "status-rejected", label: "Closed" },
  pending: { cls: "status-pending", label: "Pending" },
  clarification_needed: { cls: "status-pending", label: "Clarification" },
  under_review: { cls: "status-review", label: "Under review" },
  "in-review": { cls: "status-review", label: "In review" },
  vetted: { cls: "status-review", label: "Vetted" },
  funded: { cls: "status-review", label: "Funded" },
  delegated: { cls: "status-review", label: "Delegated" },
};

export const StatusBadge = ({ status }) => {
  const s = STATUS[(status || "pending").toLowerCase()] || { cls: "status-pending", label: status };
  return (
    <span className={`${s.cls} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {s.label}
    </span>
  );
};

export const shortRef = (id) => (id ? `#${String(id).slice(-8).toUpperCase()}` : "—");
export const money = (n) => `$${parseFloat(n || 0).toLocaleString()}`;
export const initials = (name) =>
  (name || "").split(/[\s@.]+/).filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// Date-range options shared by the list pages.
export const DATE_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];
export const withinRange = (date, range) =>
  range === "all" || (date && Date.now() - new Date(date).getTime() <= Number(range) * 86400000);

// Kebab menu for a table's Actions column. Rendered via a portal to <body>
// with fixed positioning so it isn't clipped by the table's horizontal-scroll
// wrapper or the card's rounded-corner overflow.
export const ActionsMenu = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    // Any scroll (the page or the table's own horizontal scroll) closes the
    // menu rather than trying to keep it glued to the button.
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const visible = actions.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
        aria-label="Actions"
      >
        <EllipsisVertical className="w-4 h-4" />
      </button>
      {open && coords && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: coords.top, right: coords.right }}
          className="z-50 w-48 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 py-1"
        >
          {visible.map((a) => (
            <button
              key={a.label}
              onClick={(e) => { e.stopPropagation(); setOpen(false); a.onClick(); }}
              disabled={a.disabled}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors disabled:opacity-50 ${
                a.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {a.icon && <a.icon className="w-4 h-4" />}
              {a.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
