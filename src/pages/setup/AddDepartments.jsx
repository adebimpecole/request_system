import React, { useState } from "react";

const AddDepartments = ({ Add, Delete }) => {
  const [departments, setDepartments] = useState([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (departments.map((d) => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists.`);
      return;
    }
    const updated = [...departments, trimmed];
    setDepartments(updated);
    Add(trimmed);
    setValue("");
    setError("");
  };

  const handleDelete = (index) => {
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
    Delete(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Add the departments or branches in your organization. You can always edit these later.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Finance, Operations, HR..."
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary px-4 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>
      )}

      {/* List */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Departments ({departments.length})
        </p>

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <p className="text-xs text-slate-400">No departments added yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {departments.map((dept, index) => (
              <div
                key={dept + index}
                className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-medium group"
              >
                <span className="capitalize">{dept}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="text-brand-400 hover:text-red-500 transition-colors ml-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDepartments;
