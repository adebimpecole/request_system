import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronRight, CircleAlert, CircleCheck, CircleX, Clock, FileText, Info,
  MessageCircleQuestion, Plus, Settings, Users,
} from "lucide-react";
import { Card, PrimaryButton, SecondaryButton, StatGrid, StatusBadge, pct } from "../../../components/ui/PageKit";
import api from "../../../utilis/api";
import { getFormattedDate, needsMyAction, needsMyResponse } from "../../../utilis/functions";
import { getId, getDisplayName, getRole, getEmail, getUser, getCompanyId, getToken } from "../../../utilis/storage";
import { getSocket } from "../../../utilis/socket";
import { canCreateRequests } from "../../../utilis/roles";

const money = (n) => `$${parseFloat(n || 0).toLocaleString()}`;
const shortId = (id) => (id ? `#${String(id).slice(-8).toUpperCase()}` : "—");

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CardHeader = ({ title, sub, action, badge }) => (
  <div className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-slate-100">
    <div className="min-w-0">
      <h2 className="font-bold text-navy-900 text-[15px] flex items-center gap-2">
        {title}
        {badge > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{badge}</span>}
      </h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const ViewAll = ({ onClick }) => (
  <button onClick={onClick} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 flex-shrink-0">
    View all <ArrowRight className="w-4 h-4" />
  </button>
);

// Compact shortcut row used in the Quick links card
const QuickLink = ({ icon: Icon, title, desc, onClick }) => (
  <button onClick={onClick} className="group w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition-colors">
    <span className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-semibold text-navy-900">{title}</span>
      <span className="block text-xs text-slate-500 truncate">{desc}</span>
    </span>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
  </button>
);

const EmployeesPanel = () => {
  const companyId = getCompanyId();
  const token = getToken();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/company/get_company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data?.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleApprover = async (employee) => {
    setTogglingId(employee._id);
    const isApprover = employee.role === "approver";
    try {
      await api.post(
        `/approver/${isApprover ? "unassign" : "assign"}`,
        { company_id: companyId, employee_id: employee._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  return (
    <Card>
      <CardHeader title="Employees" sub="Quickly appoint or remove approvers for your organization" />
      {loading ? (
        <div className="p-8 flex items-center justify-center gap-2 text-slate-400 text-sm"><Spinner />Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">No employees yet.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {employees.map((emp) => {
            const isApprover = emp.role === "approver";
            return (
              <div key={emp._id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {(emp.name || emp.email)[0].toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 capitalize truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.email} · {emp.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${isApprover ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"}`}>
                    {{ admin: "Admin", approver: "Approver", department_head: "Department Head", requester: "Requester" }[emp.role] || emp.role}
                  </span>
                  <button
                    onClick={() => toggleApprover(emp)}
                    disabled={togglingId === emp._id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      isApprover ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {togglingId === emp._id ? <Spinner /> : isApprover ? "Remove Approver" : "Make Approver"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [actionRequests, setActionRequests] = useState([]);
  const [actionLoaded, setActionLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const user = getDisplayName() || "User";
  const role = getRole();
  // Admins and approvers see the organization's latest requests; everyone else sees their own
  const companyWide = role === "admin" || role === "approver";
  const canCreate = canCreateRequests(role);

  useEffect(() => {
    const companyId = getCompanyId();
    const myId = getId();

    const load = async (isInitial) => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get(`/request/stats/${companyId}`),
          companyWide
            ? api.get(`/company/requests/${companyId}`).catch((e) => (e.response?.status === 404 ? { data: [] } : Promise.reject(e)))
            : api.get(`/employee/requests/${myId}`),
        ]);
        setStats(statsRes.data || {});
        setRecentRequests([...(recentRes.data || [])].sort((a, b) => new Date(b.date_created) - new Date(a.date_created)));
      } catch (e) { console.error(e); }
      finally { if (isInitial) setLoading(false); }
    };
    load(true);

    if (role === "requester") return;

    const loadActionItems = async () => {
      try {
        const [companyRequestsRes, companyRes] = await Promise.all([
          api.get(`/company/requests/${companyId}`).catch((e) => (e.response?.status === 404 ? { data: [] } : Promise.reject(e))),
          api.get(`/company/get_company/${companyId}`),
        ]);
        const approversDoc = companyRes.data?.approvers;
        setEmployees(companyRes.data?.employees || []);
        const ctx = {
          role,
          myId,
          myEmail: getEmail(),
          myDepartment: getUser()?.department,
          fundingAuthority: approversDoc?.funding_authority,
          verificationAuthority: approversDoc?.verification_authority,
        };
        const items = (companyRequestsRes.data || [])
          .map((r) => {
            if (needsMyAction(r, ctx)) return { ...r, _actionType: "approve" };
            if (needsMyResponse(r, ctx)) return { ...r, _actionType: "respond" };
            return null;
          })
          .filter(Boolean);
        setActionRequests(items);
      } catch (e) { console.error(e); }
      finally { setActionLoaded(true); }
    };
    loadActionItems();

    const socket = getSocket();
    if (!socket) return;
    const onNotification = (payload) => {
      if (["new_request", "request_update", "clarification"].includes(payload?.type)) {
        load(false);
        if (role !== "requester") loadActionItems();
      }
    };
    socket.on("notification", onNotification);
    return () => socket.off("notification", onNotification);
  }, [role]);

  const { total = 0, approved = 0, pending = 0, rejected = 0, totalAmount = 0 } = stats;
  const openDetails = (id) => navigate(`/employeedashboard/request-details/${id}`);
  const goRequests = () => navigate("/employeedashboard/requests");

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const nameById = Object.fromEntries(employees.map((e) => [String(e._id), e.name]));
  const requesterName = (r) => (String(r.user_id) === getId() ? "You" : nameById[String(r.user_id)]);

  const links = [
    canCreate && { icon: Plus, title: "New request", desc: "Create a financial request", onClick: () => navigate("/employeedashboard/requests/new") },
    { icon: FileText, title: "View requests", desc: "Track approvals and history", onClick: goRequests },
    role === "admin"
      ? { icon: Settings, title: "Manage workflows", desc: "Approvers, roles and departments", onClick: () => navigate("/employeedashboard/settings") }
      : role === "requester"
        ? { icon: Settings, title: "Account settings", desc: "Profile and password", onClick: () => navigate("/employeedashboard/settings") }
        : { icon: Users, title: "View team", desc: "People and their roles", onClick: () => navigate("/employeedashboard/team") },
    role === "admin" && { icon: Users, title: "View team", desc: "People and their roles", onClick: () => navigate("/employeedashboard/team") },
  ].filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-1.5">{today}</p>
          <h1 className="text-[28px] font-extrabold text-navy-900 tracking-tight leading-tight">
            Welcome back, <span className="capitalize">{user.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's where {companyWide ? "your organization's" : "your"} financial requests stand today.</p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton icon={FileText} onClick={goRequests}>View requests</SecondaryButton>
          {canCreate && <PrimaryButton icon={Plus} onClick={() => navigate("/employeedashboard/requests/new")}>New request</PrimaryButton>}
        </div>
      </div>

      <StatGrid
        items={[
          { label: "Total requests", value: total, sub: `${money(totalAmount)} disbursed`, icon: FileText, tone: "brand" },
          { label: "Pending", value: pending, sub: `${pct(pending, total)} in the approval chain`, icon: Clock, tone: "amber" },
          { label: "Approved", value: approved, sub: `${pct(approved, total)} approval rate`, icon: CircleCheck, tone: "emerald" },
          { label: "Rejected", value: rejected, sub: `${pct(rejected, total)} of all requests`, icon: CircleX, tone: "red" },
        ]}
      />

      {/* Both columns stretch to the same height so the row's bottom edges line up */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-6">
        {/* Recent requests */}
        <Card className="min-w-0 overflow-hidden flex flex-col">
          <CardHeader title="Recent requests" sub={companyWide ? "The latest requests across your organization" : "Your latest requisition submissions"} action={<ViewAll onClick={goRequests} />} />
          {loading ? (
            <div className="p-10 flex justify-center text-brand-500"><Spinner className="w-6 h-6" /></div>
          ) : recentRequests.length === 0 ? (
            <div className="p-12 text-center">
              <span className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-slate-400" />
              </span>
              <p className="font-semibold text-navy-900 mb-1">No requests yet</p>
              <p className="text-sm text-slate-400 mb-5">
                {companyWide ? "Requests your team submits will appear here." : "Your recent requests will appear here once you create them."}
              </p>
              {canCreate && !companyWide && <PrimaryButton icon={Plus} onClick={() => navigate("/employeedashboard/requests/new")}>Create your first request</PrimaryButton>}
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold text-slate-500">
                    <th className="px-5 sm:px-6 py-3">Request</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 sm:px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.slice(0, 6).map((r, i) => (
                    <tr key={r.request_id || i} onClick={() => openDetails(r.request_id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                      <td className="px-5 sm:px-6 py-3.5">
                        <span className="block font-semibold text-navy-900 capitalize group-hover:text-brand-600 transition-colors truncate max-w-[18rem]">{r.title}</span>
                        <span className="block text-xs text-slate-400 capitalize">
                          <span className="font-mono">{shortId(r.request_id)}</span> · {r.department || "—"}
                          {companyWide && requesterName(r) && <> · {requesterName(r)}</>}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-navy-900 whitespace-nowrap tabular-nums">{money(r.amount)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-5 sm:px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap text-right">{getFormattedDate(r.date_created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && recentRequests.length > 0 && (
            <div className="mt-auto px-5 sm:px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {Math.min(6, recentRequests.length)} of {recentRequests.length} requests</span>
              <button onClick={goRequests} className="font-semibold text-brand-600 hover:text-brand-700">See all requests</button>
            </div>
          )}
        </Card>

        {/* Side column — the first card takes up any spare height */}
        <div className="flex flex-col gap-6">
          {role !== "requester" ? (
            <Card className="overflow-hidden flex-1 flex flex-col">
              <CardHeader
                title="Needs your action"
                sub="Waiting on your approval"
                badge={actionRequests.length}
                action={actionRequests.length > 0 && <ViewAll onClick={goRequests} />}
              />
              {!actionLoaded ? (
                <div className="p-8 flex-1 flex items-center justify-center text-brand-500"><Spinner className="w-6 h-6" /></div>
              ) : actionRequests.length === 0 ? (
                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                    <CircleCheck className="w-6 h-6 text-emerald-500" />
                  </span>
                  <p className="font-semibold text-navy-900 text-sm">You're all caught up</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nothing needs your review right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {actionRequests.slice(0, 5).map((r) => {
                    const isResponse = r._actionType === "respond";
                    const Icon = isResponse ? MessageCircleQuestion : CircleAlert;
                    return (
                      <button key={r.request_id} onClick={() => openDetails(r.request_id)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition-colors group">
                        <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-navy-900 capitalize truncate group-hover:text-brand-600">{r.title}</span>
                          <span className="block text-xs text-slate-400 capitalize truncate">
                            {isResponse ? "Clarification needs your response" : `${r.department} · ${r.category}`}
                          </span>
                        </span>
                        <span className="text-sm font-bold text-navy-900 flex-shrink-0 tabular-nums">{money(r.amount)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-5 flex-1 flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold text-navy-900 text-sm mb-1">Need assistance?</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Questions about a request? Ask on its clarification thread, or contact your finance admin.
                </p>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader title="Quick links" />
            <div className="divide-y divide-slate-100">
              {links.map((l) => <QuickLink key={l.title} {...l} />)}
            </div>
          </Card>
        </div>
      </div>

      {role === "admin" && <EmployeesPanel />}
    </div>
  );
};

export default Home;
