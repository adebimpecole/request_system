import {
  SearchCheck,
  Building2,
  Users,
  BriefcaseBusiness
} from "lucide-react";
import React from "react";

const Section = ({ title, icon: Icon, children, empty }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={16} className="text-slate-600" />}
      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
        {title}
      </p>
    </div>
    {empty ? (
      <p className="text-sm text-slate-400 italic">{empty}</p>
    ) : (
      children
    )}
  </div>
);

const ConfirmSetUp = ({ approver, type, departments }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Review your setup below. Click <strong className="text-slate-700">Go to Dashboard</strong> to confirm and continue.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Departments */}
        <Section title="Departments" icon={Building2} empty={departments.length === 0 ? "No departments added" : null}>
          <div className="flex flex-wrap gap-1.5">
            {departments.map((d, i) => (
              <span key={i} className="text-xs font-medium px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg capitalize">
                {d}
              </span>
            ))}
          </div>
        </Section>

        {/* Approvers */}
        <Section title="Approvers" icon={Users} empty={approver.length === 0 ? "No approvers added" : null}>
          <div className="space-y-1.5">
            {approver.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {a[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-slate-700 font-medium truncate">{a}</span>
                {i === 0 && (
                  <span className="text-[9px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">Admin</span>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Funding Approver */}
        <Section title="Funding Approver" icon={BriefcaseBusiness} empty={!type.fund ? "Not assigned" : null}>
          {type.fund && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {type.fund[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-slate-800 font-semibold">{type.fund}</span>
            </div>
          )}
        </Section>
        {/* Vetting Approver */}
        <Section title="Vetting Approver" icon={SearchCheck} empty={!type.vet ? "Not assigned" : null}>
          {type.vet && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {type.vet[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-slate-800 font-semibold">{type.vet}</span>
            </div>
          )}
        </Section>
      </div>

      {/* Ready notice */}
      <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3.5">
        <svg className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-brand-700">
          You can update departments, approvers, and roles at any time from your <strong>Settings</strong> page.
        </p>
      </div>
    </div>
  );
};

export default ConfirmSetUp;
