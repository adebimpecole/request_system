import React from "react";
import { Building2, Info, ShieldCheck, Users, Wallet } from "lucide-react";

const SummaryCard = ({ icon: Icon, title, onEdit, empty, children }) => (
  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-card p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <p className="text-sm font-bold text-navy-900">{title}</p>
      </div>
      <button type="button" onClick={onEdit} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Edit</button>
    </div>
    <div className="pl-12">
      {empty ? <p className="text-sm text-slate-400 italic">{empty}</p> : children}
    </div>
  </div>
);

const ConfirmSetUp = ({ departments, approvers, type, isAdmin, onEdit }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryCard
        icon={Building2}
        title={`Departments (${departments.length})`}
        onEdit={() => onEdit(1)}
        empty={departments.length === 0 && "No departments added"}
      >
        <p className="text-sm text-slate-600 leading-relaxed capitalize">{departments.join(", ")}</p>
      </SummaryCard>

      <SummaryCard
        icon={Users}
        title={`Approvers (${approvers.length})`}
        onEdit={() => onEdit(2)}
        empty={approvers.length === 0 && "No approvers added"}
      >
        <ul className="space-y-1">
          {approvers.map((a, i) => (
            <li key={a} className="text-sm text-slate-600 truncate">
              {a}{isAdmin(a, i) && <span className="text-slate-400"> (Admin)</span>}
            </li>
          ))}
        </ul>
      </SummaryCard>

      <SummaryCard icon={Wallet} title="Funding approver" onEdit={() => onEdit(3)} empty={!type.fund && "Not assigned"}>
        <p className="text-sm text-slate-600 truncate">{type.fund}</p>
      </SummaryCard>

      <SummaryCard icon={ShieldCheck} title="Vetting approver" onEdit={() => onEdit(4)} empty={!type.vet && "Not assigned"}>
        <p className="text-sm text-slate-600 truncate">{type.vet}</p>
      </SummaryCard>
    </div>

    <div className="flex items-start gap-3 rounded-xl bg-brand-50 ring-1 ring-brand-100 px-4 py-3.5">
      <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-brand-800">
        Once you finish, your team can start using the financial requisition system. You can update departments, approvers and roles at any time from <strong>Settings</strong>.
      </p>
    </div>
  </div>
);

export default ConfirmSetUp;
