import React, { useState } from "react";
import { Mail, Plus, Trash2, X } from "lucide-react";
import RowMenu from "./RowMenu";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const AddApprovers = ({ approvers, onChange, isAdmin }) => {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setError("Please enter a valid email address."); return; }
    if (approvers.includes(trimmed)) { setError(`"${trimmed}" is already added.`); return; }
    onChange([...approvers, trimmed]);
    setValue("");
    setError("");
  };

  const cancel = () => { setAdding(false); setValue(""); setError(""); };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="space-y-2.5">
      {approvers.map((email, index) => {
        const admin = isAdmin(email, index);
        return (
          <div key={email} className="flex items-center gap-4 rounded-xl bg-white ring-1 ring-slate-100 shadow-sm px-4 py-3">
            <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {email[0]?.toUpperCase()}
            </span>
            <span className="flex-1 min-w-0 text-sm font-medium text-navy-900 truncate">{email}</span>
            <span className="hidden sm:block text-xs text-slate-400">{admin ? "Admin" : "Approver"}</span>
            {admin ? (
              <>
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 ring-1 ring-brand-200 rounded-full px-2 py-0.5">Default</span>
                <span className="w-8" />
              </>
            ) : (
              <RowMenu
                label={`Options for ${email}`}
                items={[{ label: "Remove", icon: Trash2, danger: true, onClick: () => onChange(approvers.filter((_, i) => i !== index)) }]}
              />
            )}
          </div>
        );
      })}

      {adding ? (
        <div className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                autoFocus
                aria-label="Approver email"
                className="block w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="approver@company.com"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button type="button" onClick={handleAdd} className="h-10 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
              Add
            </button>
            <button type="button" onClick={cancel} aria-label="Cancel" className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-navy-900 hover:bg-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/40 py-4 text-sm font-semibold text-brand-600 transition-colors"
        >
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center"><Plus className="w-3.5 h-3.5" strokeWidth={3} /></span>
          Add approver
        </button>
      )}
    </div>
  );
};

export default AddApprovers;
