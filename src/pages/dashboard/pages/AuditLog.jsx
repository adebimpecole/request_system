import React, { useEffect, useState } from "react";
import {
  BadgeCheck, Building2, CalendarDays, CircleCheck, CircleX, ClipboardList, Filter, GitMerge, Lock,
  MessageCircleQuestion, MessageSquare, PlusCircle, ShieldCheck, SlidersHorizontal, Trash2, User,
  UserCheck, UserMinus, UserPlus, Wallet,
} from "lucide-react";
import api from "../../../utilis/api";
import { getCompanyId } from "../../../utilis/storage";
import { Card, DATE_RANGES, EmptyState, PageHeader, SecondaryButton, SelectField, Spinner, initials, shortRef, withinRange } from "../../../components/ui/PageKit";

// Label, icon and colour for each audited action
const ACTIONS = {
  "request.created": { label: "New request created", icon: PlusCircle, tone: "bg-brand-50 text-brand-600" },
  "request.approved": { label: "Request approved", icon: CircleCheck, tone: "bg-emerald-50 text-emerald-600" },
  "request.rejected": { label: "Request rejected", icon: CircleX, tone: "bg-red-50 text-red-600" },
  "request.clarification_requested": { label: "Clarification requested", icon: MessageCircleQuestion, tone: "bg-amber-50 text-amber-600" },
  "request.clarification_responded": { label: "Clarification answered", icon: MessageSquare, tone: "bg-sky-50 text-sky-600" },
  "request.closed": { label: "Request closed", icon: Lock, tone: "bg-slate-100 text-slate-600" },
  "request.status_overridden": { label: "Status overridden", icon: SlidersHorizontal, tone: "bg-sky-50 text-sky-600" },
  "employee.invited": { label: "Member invited", icon: UserPlus, tone: "bg-brand-50 text-brand-600" },
  "employee.revoked": { label: "Rights revoked", icon: UserMinus, tone: "bg-red-50 text-red-600" },
  "employee.restored": { label: "Rights restored", icon: UserCheck, tone: "bg-emerald-50 text-emerald-600" },
  "employee.removed": { label: "Member removed", icon: Trash2, tone: "bg-red-50 text-red-600" },
  "employee.role_assigned": { label: "Role assigned", icon: BadgeCheck, tone: "bg-sky-50 text-sky-600" },
  "employee.role_unassigned": { label: "Role removed", icon: User, tone: "bg-slate-100 text-slate-600" },
  "department.merged": { label: "Departments merged", icon: GitMerge, tone: "bg-amber-50 text-amber-600" },
  "approver.funding_authority_assigned": { label: "Funding approver set", icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
  "approver.verification_authority_assigned": { label: "Verification approver set", icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-600" },
  "company.budget_updated": { label: "Budget updated", icon: Building2, tone: "bg-navy-800/10 text-navy-800" },
};

const TYPES = [
  { value: "all", label: "All activities" },
  { value: "request", label: "Requests" },
  { value: "employee", label: "Team" },
  { value: "department", label: "Departments" },
  { value: "approver", label: "Approvers" },
  { value: "company", label: "Organization" },
];

// "Today, 10:24 AM" / "Yesterday, 4:20 PM" / "Aug 8, 2026, 11:03 AM"
const when = (iso) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${time}`;
};

const AuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [type, setType] = useState("all");
  const [actor, setActor] = useState("all");
  const [range, setRange] = useState("all");
  const [error, setError] = useState("");

  const load = async (cursor) => {
    try {
      const params = cursor ? { cursor } : {};
      const res = await api.get(`/audit/company/${getCompanyId()}`, { params });
      setEntries((prev) => (cursor ? [...prev, ...res.data.entries] : res.data.entries));
      setNextCursor(res.data.nextCursor);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load activity.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { load(null); }, []);

  const loadMore = () => {
    setLoadingMore(true);
    load(nextCursor);
  };

  const actors = [...new Set(entries.map((e) => e.actor_name).filter(Boolean))].sort();
  const visible = entries.filter((e) =>
    (type === "all" || e.target_type === type) &&
    (actor === "all" || e.actor_name === actor) &&
    withinRange(e.createdAt, range)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Activity log" title="Recent Activity" desc="Track all actions, updates and changes across the financial requisition system." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectField label="Activity type" icon={Filter} value={type} onChange={setType} options={TYPES} />
        <SelectField label="User" icon={User} value={actor} onChange={setActor} options={[{ value: "all", label: "All users" }, ...actors.map((a) => ({ value: a, label: a }))]} />
        <SelectField label="Date range" icon={CalendarDays} value={range} onChange={setRange} options={DATE_RANGES} />
      </div>

      {error && <div className="rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="w-6 h-6" /></div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={entries.length ? "No activity matches these filters" : "No activity yet"}
            desc={entries.length ? "Try a different type, user or date range." : "Actions taken across your organization will show up here."}
          />
        ) : (
          <ol className="px-4 sm:px-6 py-5">
            {visible.map((e, i) => {
              const a = ACTIONS[e.action] || { label: e.action, icon: ClipboardList, tone: "bg-slate-100 text-slate-500" };
              return (
                <li key={e._id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < visible.length - 1 && <span className="absolute left-[17px] top-10 bottom-0 w-px bg-slate-200" aria-hidden="true" />}
                  <span className={`relative z-10 w-9 h-9 rounded-full ring-4 ring-white flex items-center justify-center flex-shrink-0 ${a.tone}`}>
                    <a.icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-navy-900">{a.label}</span>
                        {e.target_type === "request" && e.target_id && (
                          <span className="font-mono text-[11px] text-brand-700 bg-brand-50 rounded px-1.5 py-0.5">{shortRef(e.target_id)}</span>
                        )}
                        {!e.actor_name && <span className="text-[11px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">System</span>}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{e.message}</p>
                    </div>
                    <div className="flex items-center gap-4 md:w-80 md:justify-end flex-shrink-0">
                      <span className="text-xs text-slate-400 whitespace-nowrap">{when(e.createdAt)}</span>
                      <span className="flex items-center gap-2 min-w-0 md:w-32">
                        <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {initials(e.actor_name) || "SY"}
                        </span>
                        <span className="text-xs text-slate-600 truncate capitalize">{e.actor_name || "System"}</span>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {!loading && nextCursor && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <SecondaryButton onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more"}</SecondaryButton>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLog;
