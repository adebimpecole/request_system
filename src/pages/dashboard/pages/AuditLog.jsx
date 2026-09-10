import React, { useEffect, useState } from "react";
import api from "../../../utilis/api";
import { getCompanyId } from "../../../utilis/storage";

const ICONS = {
  request: "🧾",
  employee: "👤",
  department: "🏷️",
  approver: "✅",
  company: "🏢",
};

const ACTION_LABELS = {
  "request.created": "Request submitted",
  "request.approved": "Request approved",
  "request.rejected": "Request rejected",
  "request.clarification_requested": "Clarification requested",
  "request.clarification_responded": "Clarification responded",
  "request.closed": "Request closed",
  "request.status_overridden": "Status overridden",
  "employee.invited": "Member invited",
  "employee.revoked": "Rights revoked",
  "employee.restored": "Rights restored",
  "employee.removed": "Member removed",
  "employee.role_assigned": "Role assigned",
  "employee.role_unassigned": "Role removed",
  "department.merged": "Departments merged",
  "approver.funding_authority_assigned": "Funding approver set",
  "approver.verification_authority_assigned": "Verification approver set",
  "company.budget_updated": "Budget updated",
};

const FILTERS = [
  { key: "all", label: "All activity" },
  { key: "request", label: "Requests" },
  { key: "employee", label: "Team" },
  { key: "department", label: "Departments" },
  { key: "approver", label: "Approvers" },
  { key: "company", label: "Organization" },
];

const Spinner = () => (
  <svg className="w-5 h-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const AuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [filter, setFilter] = useState("all");
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

  const visible = filter === "all" ? entries : entries.filter((e) => e.target_type === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Activity Log</h1>
        <p className="text-slate-500 text-sm mt-1">A record of who did what, across your organization</p>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
            <p className="font-semibold text-slate-700 mb-1">No activity yet</p>
            <p className="text-sm text-slate-400">Actions taken across your organization will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visible.map((e) => (
              <div key={e._id} className="flex gap-3 px-6 py-4">
                <span className="text-lg leading-none mt-0.5 flex-shrink-0">{ICONS[e.target_type] || "•"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {ACTION_LABELS[e.action] || e.action}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5">{e.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {e.actor_name} · {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && nextCursor && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <button onClick={loadMore} disabled={loadingMore} className="btn-secondary text-sm disabled:opacity-60">
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
