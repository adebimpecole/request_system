import React, { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import RowMenu from "./RowMenu";

const tones = [
  "bg-brand-100 text-brand-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
  "bg-amber-100 text-amber-600",
  "bg-slate-100 text-navy-800",
];

const AddDepartments = ({ departments, onChange }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists.`);
      return;
    }
    onChange([...departments, trimmed]);
    setValue("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            aria-label="Department name"
            className="block w-full h-11 rounded-lg border border-slate-200 bg-white pl-3 pr-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            placeholder="Add a department, e.g. Marketing"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="h-11 inline-flex items-center gap-1.5 px-4 rounded-lg bg-brand-50 text-brand-700 text-sm font-semibold ring-1 ring-brand-200 hover:bg-brand-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>}

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-slate-200">
          <Building2 className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">No departments added yet</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {departments.map((dept, index) => (
            <li key={dept} className="flex items-center gap-4 rounded-xl bg-white ring-1 ring-slate-100 shadow-sm px-4 py-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tones[index % tones.length]}`}>
                <Building2 className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0 text-sm font-semibold text-navy-900 capitalize truncate">{dept}</span>
              <RowMenu
                label={`Options for ${dept}`}
                items={[{ label: "Remove", icon: Trash2, danger: true, onClick: () => onChange(departments.filter((_, i) => i !== index)) }]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddDepartments;
