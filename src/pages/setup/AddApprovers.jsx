import React, { useEffect, useState } from "react";
import { getEmail } from "../../utilis/storage";

const AddApprovers = ({ Add, Delete }) => {
  const [approvers, setApprovers] = useState([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const adminEmail = getEmail();

  // Seed the admin email once on mount
  useEffect(() => {
    if (adminEmail && !approvers.includes(adminEmail)) {
      setApprovers([adminEmail]);
      Add(adminEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) { setError("Please enter a valid email address."); return; }
    if (approvers.includes(trimmed)) { setError(`"${trimmed}" is already added.`); return; }
    const updated = [...approvers, trimmed];
    setApprovers(updated);
    Add(trimmed);
    setValue("");
    setError("");
  };

  const handleDelete = (index) => {
    // Prevent deleting the admin (index 0)
    if (index === 0) return;
    const updated = approvers.filter((_, i) => i !== index);
    setApprovers(updated);
    Delete(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Add the email addresses of people who will act as approvers in your organization. The admin is included by default.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="email"
          className="input-field flex-1"
          placeholder="approver@company.com"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={handleAdd} className="btn-primary px-4 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500 font-medium -mt-2">{error}</p>}

      {/* List */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Approvers ({approvers.length})
        </p>

        {approvers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p className="text-xs text-slate-400">No approvers added yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {approvers.map((email, index) => (
              <div key={email} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {email[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    index === 0
                      ? "bg-brand-50 text-brand-600 border border-brand-200"
                      : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}>
                    {index === 0 ? "Admin" : "Approver"}
                  </span>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddApprovers;
