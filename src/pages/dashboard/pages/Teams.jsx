import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../../utilis/api";
import { getCompanyId, getRole, getId } from "../../../utilis/storage";
import { setToogleInviteModal } from "../../../reduxtoolkit/features/modal/modalSlice";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";

const roleColors = {
  admin: "bg-brand-50 text-brand-700 ring-brand-200",
  requester: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approver: "bg-violet-50 text-violet-700 ring-violet-200",
  department_head: "bg-amber-50 text-amber-700 ring-amber-200",
};

const roleLabels = {
  admin: "Admin",
  requester: "Requester",
  approver: "Approver",
  department_head: "Department Head",
};

const initials = (name) =>
  (name || "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const avatarColors = [
  "from-brand-400 to-brand-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-sky-400 to-blue-600",
];

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const FILTERS = ["all", "admin", "department_head", "approver", "requester"];

const Teams = () => {
  const dispatch = useDispatch();
  const companyId = getCompanyId();
  const role = getRole();
  const myId = getId();
  const canManageApprovers = role === "admin";
  const canRevokeOrDelete = role === "admin" || role === "department_head";
  const canInvite = !!role; // any signed-in employee/admin can invite

  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const departmentOptions = [...new Set(teamList.map((m) => m.department).filter(Boolean))].sort();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/company/get_company/${companyId}`);
      setTeamList(res.data?.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = teamList.filter((m) => {
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    const matchesDept = deptFilter === "all" || m.department === deptFilter;
    const full = `${m.name} ${m.email} ${m.role}`.toLowerCase();
    const matchesSearch = !search || full.includes(search.toLowerCase());
    return matchesRole && matchesDept && matchesSearch;
  });

  const currentDeptHead = deptFilter !== "all"
    ? teamList.find((m) => m.department === deptFilter && m.role === "department_head")
    : null;

  const toggleApproverRole = async (member, targetRole) => {
    setActionError("");
    setBusyId(member._id);
    const isCurrentlyThatRole = member.role === targetRole;
    try {
      await api.post(`/approver/${isCurrentlyThatRole ? "unassign" : "assign"}`, {
        company_id: companyId,
        employee_id: member._id,
        role: targetRole,
      });
      await load();
      const roleLabel = targetRole === "department_head" ? "department head" : "approver";
      dispatch(pushAlert({
        type: "success",
        message: isCurrentlyThatRole
          ? `${member.name} is no longer a ${roleLabel}.`
          : `${member.name} is now a ${roleLabel}.`,
      }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Could not update role.");
    } finally { setBusyId(null); }
  };

  const toggleRevoke = async (member) => {
    setActionError("");
    setBusyId(member._id);
    const suspend = member.status !== "suspended";
    try {
      await api.post(`/employee/${member._id}/revoke`, { suspend });
      await load();
      dispatch(pushAlert({
        type: "success",
        message: suspend ? `${member.name}'s request rights were revoked.` : `${member.name}'s request rights were restored.`,
      }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Could not update request rights.");
    } finally { setBusyId(null); }
  };

  const deleteMember = async (member) => {
    setActionError("");
    setBusyId(member._id);
    try {
      await api.delete(`/employee/${member._id}`);
      setTeamList((p) => p.filter((m) => m._id !== member._id));
      dispatch(pushAlert({ type: "success", message: `${member.name} was removed from the team.` }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Could not remove employee.");
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Team</h1>
          <p className="text-slate-500 text-sm mt-1">{teamList.length} members in your organization</p>
        </div>
        {canInvite && (
          <button onClick={() => dispatch(setToogleInviteModal(true))} className="btn-primary self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            Invite member
          </button>
        )}
      </div>

      {actionError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Search + role filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text" placeholder="Search team members..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
          />
        </div>
        {departmentOptions.length > 0 && (
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all capitalize"
          >
            <option value="all">All departments</option>
            {departmentOptions.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        )}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "all" ? "All" : roleLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {deptFilter !== "all" && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
          currentDeptHead ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-slate-50 border border-slate-200 text-slate-600"
        }`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443" />
          </svg>
          {currentDeptHead
            ? <span className="capitalize">Department head for {deptFilter}: <strong>{currentDeptHead.name}</strong></span>
            : <span className="capitalize">No department head assigned for {deptFilter} yet.{canManageApprovers && " Use “Make Dept Head” below to assign one."}</span>}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-card">
          <p className="font-semibold text-slate-700">No team members found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Member</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {(canManageApprovers || canRevokeOrDelete) && (
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => {
                const isBusy = busyId === member._id;
                const isSelf = member._id === myId;
                return (
                  <tr key={member._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                          {initials(member.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 capitalize block">{member.name}</span>
                          <span className="text-xs text-slate-400">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 capitalize text-sm">{member.department || "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${roleColors[member.role] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                        {roleLabels[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${member.status === "suspended" ? "text-red-600" : "text-emerald-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === "suspended" ? "bg-red-500" : "bg-emerald-500"}`} />
                        {member.status === "suspended" ? "Revoked" : "Active"}
                      </span>
                    </td>
                    {(canManageApprovers || canRevokeOrDelete) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {canManageApprovers && member.role !== "admin" && (
                            <>
                              <button
                                onClick={() => toggleApproverRole(member, "approver")}
                                disabled={isBusy}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 ${
                                  member.role === "approver" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600 hover:bg-violet-50"
                                }`}
                              >
                                {member.role === "approver" ? "Unset Approver" : "Make Approver"}
                              </button>
                              <button
                                onClick={() => toggleApproverRole(member, "department_head")}
                                disabled={isBusy}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50 ${
                                  member.role === "department_head" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600 hover:bg-amber-50"
                                }`}
                              >
                                {member.role === "department_head" ? "Unset Dept Head" : "Make Dept Head"}
                              </button>
                            </>
                          )}
                          {canRevokeOrDelete && member.role !== "admin" && !isSelf && (
                            <>
                              <button
                                onClick={() => toggleRevoke(member)}
                                disabled={isBusy}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-all disabled:opacity-50"
                              >
                                {member.status === "suspended" ? "Restore Rights" : "Revoke Rights"}
                              </button>
                              <button
                                onClick={() => deleteMember(member)}
                                disabled={isBusy}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                              >
                                {isBusy ? <Spinner /> : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Teams;
