import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, CalendarDays, CircleCheck, CircleX, Clock, Copy, Eye, FileText, Plus, Search, Users, X } from "lucide-react";
import api from "../../../utilis/api";
import { getFormattedDate, needsMyAction, needsMyResponse } from "../../../utilis/functions";
import { getId, getCompanyId, getRole, getEmail, getUser } from "../../../utilis/storage";
import { canCreateRequests } from "../../../utilis/roles";
import {
  ActionsMenu, Card, DATE_RANGES, EmptyState, FilterPills, PageHeader, PrimaryButton, SelectField,
  Spinner, StatGrid, StatusBadge, money, pct, shortRef, withinRange,
} from "../../../components/ui/PageKit";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];
// Statuses that are still moving through the chain count as "pending"
const statusGroup = (status) => {
  const s = (status || "pending").toLowerCase();
  if (s === "approved") return "approved";
  if (s === "rejected" || s === "closed") return "rejected";
  return "pending";
};

const fileTones = ["bg-brand-50 text-brand-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-600", "bg-sky-50 text-sky-600"];

const Requests = () => {
  const navigate = useNavigate();

  const role = getRole();
  const myId = getId();
  const isApprover = ["approver", "department_head", "admin"].includes(role);

  const [allRequests, setAllRequests] = useState([]);
  const [approversDoc, setApproversDoc] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search lives in ?q= so the top-bar search and this page's box stay in sync
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const search = query.trim().toLowerCase();
  const setQuery = (v) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set("q", v); else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  // Approvers can narrow to what needs them, their own, or everyone else's
  const [scope, setScope] = useState("all"); // "all" | "action" | "mine" | "others"
  const [statusTab, setStatusTab] = useState("all");
  const [department, setDepartment] = useState("all");
  const [range, setRange] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let res;
        if (isApprover) {
          const [requestsRes, companyRes] = await Promise.all([
            api.get(`/company/requests/${getCompanyId()}`),
            api.get(`/company/get_company/${getCompanyId()}`),
          ]);
          res = requestsRes;
          setApproversDoc(companyRes.data?.approvers || null);
          setEmployees(companyRes.data?.employees || []);
        } else {
          res = await api.get(`/employee/requests/${myId}`);
        }
        setAllRequests(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const nameById = Object.fromEntries(employees.map((e) => [String(e._id), e.name]));
  const requesterName = (r) => (String(r.user_id) === myId ? "You" : nameById[String(r.user_id)] || "—");

  const actionCtx = {
    role,
    myId,
    myEmail: getEmail(),
    myDepartment: getUser()?.department,
    fundingAuthority: approversDoc?.funding_authority,
    verificationAuthority: approversDoc?.verification_authority,
  };
  const isActionable = (r) => needsMyAction(r, actionCtx) || needsMyResponse(r, actionCtx);

  const inScope = allRequests.filter((r) =>
    scope === "action" ? isActionable(r)
      : scope === "mine" ? String(r.user_id) === myId
        : scope === "others" ? String(r.user_id) !== myId
          : true
  );
  // Department, date and search narrow everything below, including the stat tiles
  const narrowed = inScope.filter((r) =>
    (department === "all" || r.department === department) &&
    withinRange(r.date_created, range) &&
    (!search || [r.title, r.category, r.department, r.request_id].some((v) => String(v || "").toLowerCase().includes(search)))
  );
  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? narrowed.length : narrowed.filter((r) => statusGroup(r.status) === t).length;
    return acc;
  }, {});
  const rows = statusTab === "all" ? narrowed : narrowed.filter((r) => statusGroup(r.status) === statusTab);

  const last30 = narrowed.filter((r) => withinRange(r.date_created, "30")).length;
  const departments = [...new Set(allRequests.map((r) => r.department).filter(Boolean))].sort();
  const actionCount = allRequests.filter(isActionable).length;

  const filtersActive = scope !== "all" || department !== "all" || range !== "all" || !!search;
  const clearFilters = () => { setScope("all"); setDepartment("all"); setRange("all"); setQuery(""); };
  const open = (id) => navigate(`/employeedashboard/request-details/${id}`);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Financial requisitions"
        title="Requests"
        desc={isApprover ? "View, track and manage all financial requisitions in your organization." : "Track your financial requisitions."}
        action={canCreateRequests(role) && <PrimaryButton icon={Plus} onClick={() => navigate("/employeedashboard/requests/new")}>New Request</PrimaryButton>}
      />

      <StatGrid
        items={[
          { label: "Total requests", value: counts.all, sub: `${last30} in the last 30 days`, icon: FileText, tone: "brand" },
          { label: "Pending", value: counts.pending, sub: `${pct(counts.pending, counts.all)} still in the approval chain`, icon: Clock, tone: "amber" },
          { label: "Approved", value: counts.approved, sub: `${pct(counts.approved, counts.all)} approval rate`, icon: CircleCheck, tone: "emerald" },
          { label: "Rejected", value: counts.rejected, sub: `${pct(counts.rejected, counts.all)} rejected or closed`, icon: CircleX, tone: "red" },
        ]}
      />

      <Card>
        {/* Toolbar: status tabs + search, then filters */}
        <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-col md:flex-row md:items-center gap-3">
          <FilterPills
            value={statusTab}
            onChange={setStatusTab}
            options={STATUS_TABS.map((t) => ({ key: t, label: t[0].toUpperCase() + t.slice(1), count: counts[t] }))}
          />
          <div className="relative md:ml-auto md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              aria-label="Search requests"
              placeholder="Search title, reference, department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="px-4 sm:px-5 pb-4 flex flex-wrap items-center gap-2 border-b border-slate-100">
          {isApprover && (
            <SelectField
              label="Whose requests"
              icon={Users}
              value={scope}
              onChange={setScope}
              className="w-52"
              options={[
                { value: "all", label: "All requests" },
                { value: "action", label: `Needs my action (${actionCount})` },
                // The admin never raises requests, so "mine/others" only applies to employees
                ...(canCreateRequests(role) ? [
                  { value: "mine", label: "My requests" },
                  { value: "others", label: "Others' requests" },
                ] : []),
              ]}
            />
          )}
          {departments.length > 0 && (
            <SelectField
              label="Department"
              icon={Building2}
              value={department}
              onChange={setDepartment}
              className="w-48"
              options={[{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))]}
            />
          )}
          <SelectField label="Date range" icon={CalendarDays} value={range} onChange={setRange} className="w-40" options={DATE_RANGES} />
          {filtersActive && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-navy-900">
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="w-6 h-6" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No requests found" desc="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">Reference #</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Amount</th>
                  {isApprover && <th className="px-4 py-3">Requested by</th>}
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r, i) => (
                  <tr key={r.request_id || i} onClick={() => open(r.request_id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${fileTones[i % fileTones.length]}`}>
                          <FileText className="w-4 h-4" />
                        </span>
                        <span className="font-mono text-xs text-slate-600">{shortRef(r.request_id)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-navy-900 capitalize group-hover:text-brand-600 transition-colors">{r.title}</td>
                    <td className="px-4 py-3.5 text-slate-500 capitalize">{r.department || "—"}</td>
                    <td className="px-4 py-3.5 font-semibold text-navy-900 whitespace-nowrap">{money(r.amount)}</td>
                    {isApprover && <td className="px-4 py-3.5 text-slate-500 capitalize whitespace-nowrap">{requesterName(r)}</td>}
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{getFormattedDate(r.date_created)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "View details", icon: Eye, onClick: () => open(r.request_id) },
                          { label: "Copy reference", icon: Copy, onClick: () => navigator.clipboard?.writeText(shortRef(r.request_id)) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500">
            Showing <span className="font-semibold text-navy-900">{rows.length}</span> of{" "}
            <span className="font-semibold text-navy-900">{inScope.length}</span> requests
          </div>
        )}
      </Card>
    </div>
  );
};

export default Requests;
