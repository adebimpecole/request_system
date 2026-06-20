import React, { useState } from "react";

const SetVettingApprover = ({ Set, approver }) => {
  const [selected, setSelected] = useState("");

  const handleSelect = (value) => {
    setSelected(value);
    Set(value, "vet");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500 leading-relaxed">
          The vetting approver reviews requests for accuracy and policy compliance before they reach the funding stage. Select one approver for this role.
        </p>
      </div>

      {approver.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-xs text-slate-400">No approvers found. Go back and add approvers first.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Select from approvers
          </p>
          {approver.map((email) => {
            const isSelected = selected === email;
            return (
              <button
                key={email}
                type="button"
                onClick={() => handleSelect(email)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "border-brand-600 bg-brand-600" : "border-slate-300"
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isSelected ? "bg-brand-200 text-brand-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {email[0]?.toUpperCase()}
                </div>

                <span className={`text-sm font-medium flex-1 ${isSelected ? "text-brand-700" : "text-slate-700"}`}>
                  {email}
                </span>

                {isSelected && (
                  <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">
            <span className="font-semibold">{selected}</span> set as Vetting Approver
          </p>
        </div>
      )}
    </div>
  );
};

export default SetVettingApprover;
