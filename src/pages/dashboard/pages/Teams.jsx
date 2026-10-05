import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BadgeCheck, Building2, GraduationCap, Lock, Search, Star, Trash2, UserMinus, UserPlus, Users } from "lucide-react";
import api from "../../../utilis/api";
import { getCompanyId, getRole, getId } from "../../../utilis/storage";
import { setToogleInviteModal } from "../../../reduxtoolkit/features/modal/modalSlice";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";
import {
  ActionsMenu, Card, EmptyState, FilterPills, PageHeader, PrimaryButton, SelectField, Spinner, StatGrid, initials, pct,
} from "../../../components/ui/PageKit";

const roleColors = {
  admin: "bg-brand-50 text-brand-700 ring-brand-200",
  requester: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  approver: "bg-sky-50 text-sky-700 ring-sky-200",
  department_head: "bg-amber-50 text-amber-700 ring-amber-200",
};

const roleLabels = {
  admin: "Admin",
  requester: "Requester",
  approver: "Approver",
  department_head: "Department Head",
};

const avatarTones = [
  "bg-brand-50 text-brand-600",
  "bg-emerald-50 text-emerald-600",
  "bg-sky-50 text-sky-600",
  "bg-amber-50 text-amber-600",
];

const ROLE_TABS = [
  { key: "all", label: "All" },
  { key: "admin", label: "Admins" },
  { key: "department_head", label: "Department heads" },
  { key: "approver", label: "Approvers" },
  { key: "requester", label: "Requesters" },
];

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

  // Department + search narrow the list; role pills and their counts apply on top
  const narrowed = teamList.filter((m) => {
    const matchesDept = deptFilter === "all" || m.department === deptFilter;
    const full = `${m.name} ${m.email} ${m.role} ${m.department}`.toLowerCase();
    return matchesDept && (!search || full.includes(search.toLowerCase()));
  });
  const filtered = roleFilter === "all" ? narrowed : narrowed.filter((m) => m.role === roleFilter);
  const roleCount = (r) => (r === "all" ? narrowed.length : narrowed.filter((m) => m.role === r).length);

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

  const showActions = canManageApprovers || canRevokeOrDelete;
  const heads = teamList.filter((m) => m.role === "department_head").length;
  const headedDepts = new Set(teamList.filter((m) => m.role === "department_head").map((m) => m.department)).size;
  const approverCount = teamList.filter((m) => m.role === "approver").length;
  const revoked = teamList.filter((m) => m.status === "suspended").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Organization"
        title="Team"
        desc="View and manage the people in your organization and the roles they hold."
        action={canInvite && <PrimaryButton icon={UserPlus} onClick={() => dispatch(setToogleInviteModal(true))}>Invite member</PrimaryButton>}
      />

      <StatGrid
        items={[
          { label: "Total members", value: teamList.length, sub: `Across ${departmentOptions.length} department${departmentOptions.length === 1 ? "" : "s"}`, icon: Users, tone: "brand" },
          { label: "Department heads", value: heads, sub: `${headedDepts} of ${departmentOptions.length} departments covered`, icon: GraduationCap, tone: "amber" },
          { label: "Approvers", value: approverCount, sub: `${pct(approverCount, teamList.length)} of the team`, icon: BadgeCheck, tone: "sky" },
          { label: "Revoked", value: revoked, sub: revoked ? "Can't submit requests" : "Everyone can submit requests", icon: UserMinus, tone: "red" },
        ]}
      />

      {actionError && (
        <div className="rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      <Card>
        {/* Filters */}
        <div className="px-4 sm:px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-3 border-b border-slate-100">
          <FilterPills
            value={roleFilter}
            onChange={setRoleFilter}
            options={ROLE_TABS.map((t) => ({ ...t, count: roleCount(t.key) }))}
          />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                aria-label="Search team members"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            {departmentOptions.length > 0 && (
              <SelectField
                label="Department"
                icon={Building2}
                value={deptFilter}
                onChange={setDeptFilter}
                className="w-44"
                options={[{ value: "all", label: "All departments" }, ...departmentOptions.map((d) => ({ value: d, label: d }))]}
              />
            )}
          </div>
        </div>

        {deptFilter !== "all" && (
          <div className={`px-5 py-2.5 border-b text-xs flex items-center gap-2 ${
            currentDeptHead ? "bg-amber-50/60 border-amber-100 text-amber-800" : "bg-slate-50 border-slate-100 text-slate-600"
          }`}>
            <GraduationCap className="w-4 h-4 flex-shrink-0" />
            {currentDeptHead
              ? <span className="capitalize">Department head for {deptFilter}: <strong>{currentDeptHead.name}</strong></span>
              : <span className="capitalize">No department head assigned for {deptFilter} yet.{canManageApprovers && " Use “Make dept head” in a member's actions to assign one."}</span>}
          </div>
        )}

        {loading ? (
          <div className="p-12 flex justify-center"><Spinner className="w-6 h-6" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No team members found" desc="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  {showActions && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((member, i) => {
                  const isBusy = busyId === member._id;
                  const isSelf = member._id === myId;
                  const suspended = member.status === "suspended";
                  return (
                    <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarTones[i % avatarTones.length]}`}>
                            {initials(member.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-navy-900 capitalize truncate">{member.name}{isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}</span>
                            <span className="block text-xs text-slate-400 truncate">{member.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 capitalize">{member.department || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 whitespace-nowrap ${roleColors[member.role] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                          {roleLabels[member.role] || member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={suspended ? "status-rejected" : "status-approved"}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                          {suspended ? "Revoked" : "Active"}
                        </span>
                      </td>
                      {showActions && (
                        <td className="px-5 py-3.5 text-right">
                          {isBusy ? (
                            <span className="inline-flex p-1.5"><Spinner className="w-4 h-4" /></span>
                          ) : (
                            <ActionsMenu
                              actions={[
                                canManageApprovers && member.role !== "admin" && {
                                  label: member.role === "approver" ? "Unset approver" : "Make approver",
                                  icon: BadgeCheck,
                                  onClick: () => toggleApproverRole(member, "approver"),
                                },
                                canManageApprovers && member.role !== "admin" && {
                                  label: member.role === "department_head" ? "Unset dept head" : "Make dept head",
                                  icon: Star,
                                  onClick: () => toggleApproverRole(member, "department_head"),
                                },
                                canRevokeOrDelete && member.role !== "admin" && !isSelf && {
                                  label: suspended ? "Restore rights" : "Revoke rights",
                                  icon: Lock,
                                  onClick: () => toggleRevoke(member),
                                },
                                canRevokeOrDelete && member.role !== "admin" && !isSelf && {
                                  label: "Delete",
                                  icon: Trash2,
                                  onClick: () => deleteMember(member),
                                  danger: true,
                                },
                              ]}
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500">
            Showing <span className="font-semibold text-navy-900">{filtered.length}</span> of{" "}
            <span className="font-semibold text-navy-900">{teamList.length}</span> members
          </div>
        )}
      </Card>
    </div>
  );
};

export default Teams;
