import React from "react";
import { TriangleAlert, X } from "lucide-react";

const ConfirmSkipModal = ({ isOpen, closeModal, onSkip }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={closeModal} />
      <div role="dialog" aria-modal="true" aria-labelledby="skip-title" className="relative w-full max-w-md rounded-2xl bg-white shadow-modal p-6">
        <button onClick={closeModal} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100">
          <X className="w-4 h-4" />
        </button>
        <span className="w-11 h-11 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-600 flex items-center justify-center mb-4">
          <TriangleAlert className="w-5 h-5" />
        </span>
        <h2 id="skip-title" className="text-lg font-bold text-navy-900 mb-1.5">Leave setup?</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Steps you haven't saved yet will be lost. You can finish configuring departments and approvers later from Settings.
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button onClick={closeModal} className="h-10 px-4 rounded-lg ring-1 ring-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Continue setup
          </button>
          <button onClick={onSkip} className="h-10 px-4 rounded-lg bg-brand-700 hover:bg-brand-800 text-sm font-semibold text-white">
            Skip to dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSkipModal;
