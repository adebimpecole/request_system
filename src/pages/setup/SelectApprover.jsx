import React, { useState } from "react";
import { Search, UserRound } from "lucide-react";

// Single-choice approver picker used for both the funding and vetting roles.
const SelectApprover = ({ approvers, value, onChange, isAdmin, label }) => {
  const [query, setQuery] = useState("");

  if (approvers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-slate-200">
        <UserRound className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">No approvers found. Go back and add approvers first.</p>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visible = approvers
    .map((email, index) => ({ email, index }))
    .filter(({ email }) => !q || email.toLowerCase().includes(q));

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-card p-5">
      <p className="text-sm font-semibold text-navy-900 mb-3">Select from approvers</p>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          aria-label="Search approvers"
          className="block w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          placeholder="Search approver..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div role="radiogroup" aria-label={label} className="space-y-2.5">
        {visible.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No approvers match "{query}".</p>}
        {visible.map(({ email, index }) => {
          const selected = value === email;
          return (
            <button
              key={email}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(email)}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors ${
                selected ? "bg-brand-50 ring-2 ring-brand-300" : "bg-white ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "ring-2 ring-brand-600" : "ring-2 ring-slate-300"}`}>
                {selected && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm font-medium truncate ${selected ? "text-brand-800" : "text-navy-900"}`}>{email}</span>
                <span className="block text-xs text-slate-400">{isAdmin(email, index) ? "Admin" : "Approver"}</span>
              </span>
              {selected && (
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-100 rounded-full px-2.5 py-0.5">Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectApprover;
