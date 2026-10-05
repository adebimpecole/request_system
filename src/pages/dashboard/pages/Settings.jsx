import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  BadgeCheck, Briefcase, Building2, CircleCheck, DollarSign, GitMerge, KeyRound, Lock, Mail,
  Plus, ShieldCheck, Trash2, User, UserCog, Users, Wallet, X,
} from "lucide-react";
import api from "../../../utilis/api";
import { getId, getToken, getRole, getEmail, getDisplayName, getUser, getCompanyId } from "../../../utilis/storage";
import { getApproverDesignation } from "../../../utilis/functions";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";
import { Card, PageHeader, PrimaryButton, SecondaryButton, Spinner, initials as toInitials, money } from "../../../components/ui/PageKit";
import { PasswordInput, TextInput } from "../../../components/auth/Fields";

const ROLE_LABELS = { admin: "Admin", approver: "Approver", department_head: "Department Head", requester: "Requester" };

// Card with an icon header, used for every settings section
const Section = ({ icon: Icon, tone = "bg-brand-50 text-brand-600", title, desc, action, children, className = "" }) => (
  <Card className={`p-5 sm:p-6 ${className}`}>
    <div className="flex items-start gap-3 mb-5">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tone}`}><Icon className="w-4 h-4" /></span>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-navy-900 text-[15px]">{title}</h2>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {action}
    </div>
    {children}
  </Card>
);

// Form row with a leading icon tile, as in the Settings mockup
const IconField = ({ icon: Icon, label, htmlFor, children }) => (
  <div className="flex items-start gap-3">
    <span className="w-9 h-9 mt-6 rounded-lg bg-slate-50 ring-1 ring-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4" />
    </span>
    <div className="flex-1 min-w-0">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-navy-900 mb-1.5">{label}</label>
      {children}
    </div>
  </div>
);

const Saved = ({ show, text = "Saved" }) =>
  show ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CircleCheck className="w-4 h-4" />{text}</span> : null;

const Busy = ({ label }) => <><Spinner className="w-4 h-4 text-white" />{label}</>;

// Profile Tab
const ProfileTab = ({ userid, token, role, storedUser, initials, companyData, goTo }) => {
  const dispatch = useDispatch();
  const isAdmin = role === "admin";

  const emptyProfile = { firstname: "", lastname: "", department: "", email: "", companyname: "" };
  const [profile, setProfile] = useState(emptyProfile);
  const [initialProfile, setInitialProfile] = useState(emptyProfile);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwords, setPasswords] = useState({ oldpassword: "", newpassword: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const onProfile = (e) => setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onPassword = (e) => { setPasswords((p) => ({ ...p, [e.target.name]: e.target.value })); setPasswordError(""); };

  useEffect(() => {
    if (isAdmin) {
      const next = { ...emptyProfile, companyname: getUser().company_name || "" };
      setProfile(next);
      setInitialProfile(next);
      return;
    }
    const load = async () => {
      try {
        const userRes = await api.get(`/employee/${userid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const next = {
          ...emptyProfile,
          firstname: userRes.data.first_name || userRes.data.firstname || "",
          lastname: userRes.data.last_name || userRes.data.lastname || "",
          email: userRes.data.email || "",
          department: userRes.data.department || "",
        };
        setProfile(next);
        setInitialProfile(next);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const profileDirty = Object.keys(profile).some((k) => profile[k] !== initialProfile[k]);

  // Both forms post to the same endpoint; empty fields are left out so they don't overwrite anything
  const post = (fields) =>
    api.post(`/employee/${userid}`, Object.fromEntries(Object.entries(fields).filter(([, v]) => String(v).trim() !== "")), {
      headers: { Authorization: `Bearer ${token}` },
    });

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await post(isAdmin ? { companyname: profile.companyname } : { firstname: profile.firstname, lastname: profile.lastname, email: profile.email, department: profile.department });
      setInitialProfile(profile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      dispatch(pushAlert({ type: "error", message: err.response?.data?.message || "Could not save your profile." }));
    } finally { setProfileSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!isAdmin && !passwords.oldpassword) { setPasswordError("Enter your current password."); return; }
    if (passwords.newpassword.length < 8) { setPasswordError("New password must be at least 8 characters."); return; }
    if (passwords.newpassword !== passwords.confirm) { setPasswordError("New passwords do not match."); return; }
    setPasswordSaving(true);
    try {
      await post({ oldpassword: passwords.oldpassword, newpassword: passwords.newpassword });
      setPasswords({ oldpassword: "", newpassword: "", confirm: "" });
      dispatch(pushAlert({ type: "success", message: "Password updated." }));
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not update your password.");
    } finally { setPasswordSaving(false); }
  };

  const departmentList = companyData?.departments || [];
  const companyName = companyData?.company?.company_name || getUser().company_name || "";
  const approverLabel = getApproverDesignation(getEmail(), companyData?.approvers);
  const canSeeOrg = role === "admin" || role === "approver";

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <span className="w-16 h-16 rounded-2xl bg-brand-600 text-white text-xl font-extrabold flex items-center justify-center flex-shrink-0">
              {initials || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-navy-900 capitalize truncate">{storedUser}</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 truncate"><Mail className="w-3.5 h-3.5 flex-shrink-0" />{getEmail()}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700">
                  <BadgeCheck className="w-3 h-3" />{ROLE_LABELS[role] || role}
                </span>
                {approverLabel && <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 bg-sky-50 text-sky-700">{approverLabel}</span>}
              </div>
            </div>
          </div>
          {canSeeOrg && (
            <SecondaryButton icon={Building2} onClick={() => goTo("organization")} className="self-start md:self-center">
              {isAdmin ? "Edit organization" : "View organization"}
            </SecondaryButton>
          )}
        </div>
        <dl className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["Organization", companyName || "—"],
            ["Department", profile.department || (isAdmin ? "All departments" : "—")],
            ["Team members", String((companyData?.employees || []).length)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="text-sm font-semibold text-navy-900 capitalize">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="space-y-6">
        {/* Personal information */}
        <Section icon={User} title={isAdmin ? "Organization profile" : "Personal information"} desc={isAdmin ? "Update your organization's name." : "Update your personal details and contact information."}>
          <form onSubmit={saveProfile} className="space-y-4">
            {isAdmin ? (
              <IconField icon={Building2} label="Company name" htmlFor="companyname">
                <TextInput id="companyname" name="companyname" value={profile.companyname} onChange={onProfile} />
              </IconField>
            ) : (
              <>
                <IconField icon={User} label="Full name" htmlFor="firstname">
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput id="firstname" name="firstname" placeholder="First name" value={profile.firstname} onChange={onProfile} />
                    <TextInput aria-label="Last name" name="lastname" placeholder="Last name" value={profile.lastname} onChange={onProfile} />
                  </div>
                </IconField>
                <IconField icon={Mail} label="Email address" htmlFor="email">
                  <TextInput id="email" name="email" type="email" value={profile.email} onChange={onProfile} />
                </IconField>
                <IconField icon={Briefcase} label="Department" htmlFor="department">
                  {departmentList.length > 0 ? (
                    <TextInput as="select" id="department" name="department" value={profile.department} onChange={onProfile} className="capitalize">
                      <option value="">Select department</option>
                      {departmentList.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </TextInput>
                  ) : (
                    <TextInput id="department" disabled placeholder="Loading departments..." />
                  )}
                </IconField>
              </>
            )}
            {!isAdmin && (
              <IconField icon={Building2} label="Organization" htmlFor="org">
                <TextInput id="org" value={companyName || "—"} readOnly disabled className="capitalize" />
              </IconField>
            )}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Saved show={profileSaved} />
              <PrimaryButton type="submit" disabled={profileSaving || !profileDirty}>
                {profileSaving ? <Busy label="Saving..." /> : "Save changes"}
              </PrimaryButton>
            </div>
          </form>
        </Section>

        {/* Password */}
        <Section icon={Lock} tone="bg-amber-50 text-amber-600" title="Change password" desc="Update your password for better security.">
          <form onSubmit={savePassword} className="space-y-4">
            {!isAdmin && (
              <div>
                <label htmlFor="oldpassword" className="block text-xs font-semibold text-navy-900 mb-1.5">Current password</label>
                <PasswordInput id="oldpassword" name="oldpassword" autoComplete="current-password" placeholder="Enter current password" value={passwords.oldpassword} onChange={onPassword} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="newpassword" className="block text-xs font-semibold text-navy-900 mb-1.5">New password</label>
                <PasswordInput id="newpassword" name="newpassword" autoComplete="new-password" placeholder="At least 8 characters" value={passwords.newpassword} onChange={onPassword} />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-xs font-semibold text-navy-900 mb-1.5">Confirm new password</label>
                <PasswordInput id="confirm" name="confirm" autoComplete="new-password" placeholder="Repeat new password" value={passwords.confirm} onChange={onPassword} />
              </div>
            </div>
            {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
            <div className="flex justify-end">
              <PrimaryButton type="submit" disabled={passwordSaving || !passwords.newpassword}>
                {passwordSaving ? <Busy label="Updating..." /> : "Update password"}
              </PrimaryButton>
            </div>
          </form>
        </Section>
      </div>
    </div>
  );
};

//  Organization Tab
const OrganizationTab = ({ companyId, token, role, myDepartment, companyData, refresh }) => {
  const dispatch = useDispatch();
  const isAdmin = role === "admin";
  const initialBudget = companyData?.company?.budget ?? "";
  const [budget, setBudget] = useState(initialBudget);
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const budgetDirty = String(budget) !== String(initialBudget);

  const initialDepartments = (companyData?.departments || []).map((d) => d.name);
  const [departments, setDepartments] = useState(initialDepartments);
  const [deptInput, setDeptInput] = useState("");
  const [deptSaved, setDeptSaved] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState("");
  const deptDirty = JSON.stringify([...departments].sort()) !== JSON.stringify([...initialDepartments].sort());

  const [deletingId, setDeletingId] = useState(null);
  const members = companyData?.employees || [];

  const [mergeFrom, setMergeFrom] = useState("");
  const [mergeInto, setMergeInto] = useState("");
  const [mergeConfirming, setMergeConfirming] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);

  const membersInFrom = members.filter((m) => m.department === mergeFrom).length;
  const fromHead = members.find((m) => m.department === mergeFrom && m.role === "department_head");
  const intoHead = members.find((m) => m.department === mergeInto && m.role === "department_head");

  const doMerge = async () => {
    setMergeLoading(true);
    try {
      const res = await api.post("/department/merge", { company_id: companyId, from: mergeFrom, into: mergeInto }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(pushAlert({
        type: "success",
        message: `Merged ${mergeFrom} into ${mergeInto} — ${res.data.employeesMoved} member${res.data.employeesMoved === 1 ? "" : "s"} moved.${res.data.demoted ? ` ${res.data.demoted.name} is no longer department head.` : ""}`,
      }));
      setMergeFrom(""); setMergeInto(""); setMergeConfirming(false);
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not merge departments." }));
    } finally { setMergeLoading(false); }
  };

  // Group members by department, yours first
  const departmentGroups = Object.entries(
    members.reduce((acc, m) => {
      const dept = m.department || "Unassigned";
      (acc[dept] ||= []).push(m);
      return acc;
    }, {})
  ).sort(([a], [b]) => {
    if (a === myDepartment) return -1;
    if (b === myDepartment) return 1;
    return a.localeCompare(b);
  });

  const saveBudget = async () => {
    setBudgetLoading(true);
    try {
      await api.put(`/company/${companyId}`, { budget: Number(budget) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 3000);
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not update the budget." }));
    } finally { setBudgetLoading(false); }
  };

  const addDepartment = () => {
    const trimmed = deptInput.trim();
    if (!trimmed) return;
    if (departments.map((d) => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      setDeptError("Department already exists.");
      return;
    }
    setDepartments((p) => [...p, trimmed]);
    setDeptInput("");
    setDeptError("");
  };

  const removeDepartment = (name) => setDepartments((p) => p.filter((d) => d !== name));

  const saveDepartments = async () => {
    setDeptLoading(true);
    try {
      await api.post("/department/add_department", {
        company_id: companyId,
        departments: departments.map((name) => ({ name })),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDeptSaved(true);
      setTimeout(() => setDeptSaved(false), 3000);
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not save departments." }));
    } finally { setDeptLoading(false); }
  };

  const deleteMember = async (memberId) => {
    setDeletingId(memberId);
    try {
      await api.delete(`/employee/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not remove member." }));
    } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          {/* Budget */}
          <Section icon={DollarSign} tone="bg-emerald-50 text-emerald-600" title="Budget" desc="The total approved budget for your organization.">
            <label htmlFor="budget" className="block text-xs font-semibold text-navy-900 mb-1.5">Total budget ($)</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 max-w-sm">
                <TextInput id="budget" type="number" min="0" placeholder="e.g. 50000" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <PrimaryButton onClick={saveBudget} disabled={budgetLoading || !budgetDirty} className="h-11">
                {budgetLoading ? <Busy label="Saving..." /> : "Save budget"}
              </PrimaryButton>
              <Saved show={budgetSaved} text="Budget updated" />
            </div>
            {initialBudget !== "" && !budgetDirty && <p className="text-xs text-slate-400 mt-1.5">Currently {money(initialBudget)}</p>}
          </Section>

          {/* Departments */}
          <Section icon={Building2} tone="bg-sky-50 text-sky-600" title="Departments" desc="Departments with members can't be removed — merge them into another instead.">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <TextInput
                  aria-label="New department name"
                  placeholder="New department name"
                  value={deptInput}
                  onChange={(e) => { setDeptInput(e.target.value); setDeptError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDepartment())}
                />
              </div>
              <SecondaryButton icon={Plus} type="button" onClick={addDepartment} className="h-11">Add</SecondaryButton>
            </div>
            {deptError && <p className="text-red-500 text-xs mb-3">{deptError}</p>}
            {departments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 rounded-xl border-2 border-dashed border-slate-200">No departments yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
                {departments.map((d) => {
                  const memberCount = members.filter((m) => m.department === d).length;
                  return (
                    <li key={d} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0"><Building2 className="w-4 h-4" /></span>
                      <span className="flex-1 text-sm font-semibold text-navy-900 capitalize truncate">{d}</span>
                      <span className="text-xs text-slate-400">{memberCount} member{memberCount === 1 ? "" : "s"}</span>
                      {memberCount > 0 ? (
                        <span title="Merge into another department below to remove" className="p-1.5 text-slate-300"><Lock className="w-4 h-4" /></span>
                      ) : (
                        <button type="button" onClick={() => removeDepartment(d)} aria-label={`Remove ${d}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {(deptDirty || deptSaved) && (
              <div className="flex items-center justify-end gap-3 mt-4">
                <Saved show={deptSaved} />
                <PrimaryButton onClick={saveDepartments} disabled={deptLoading || !deptDirty || departments.length === 0}>
                  {deptLoading ? <Busy label="Saving..." /> : "Save departments"}
                </PrimaryButton>
              </div>
            )}

            {initialDepartments.length >= 2 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy-900 mb-1"><GitMerge className="w-4 h-4 text-slate-400" />Merge departments</p>
                <p className="text-xs text-slate-500 mb-3">Move everyone and every request from one department into another, then remove the old one.</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-navy-900 mb-1.5">Merge</label>
                    <TextInput as="select" aria-label="Merge from" className="capitalize" value={mergeFrom} onChange={(e) => { setMergeFrom(e.target.value); setMergeConfirming(false); }}>
                      <option value="">Select department</option>
                      {initialDepartments.filter((d) => d !== mergeInto).map((d) => <option key={d} value={d}>{d}</option>)}
                    </TextInput>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-navy-900 mb-1.5">Into</label>
                    <TextInput as="select" aria-label="Merge into" className="capitalize" value={mergeInto} onChange={(e) => { setMergeInto(e.target.value); setMergeConfirming(false); }}>
                      <option value="">Select department</option>
                      {initialDepartments.filter((d) => d !== mergeFrom).map((d) => <option key={d} value={d}>{d}</option>)}
                    </TextInput>
                  </div>
                  <SecondaryButton type="button" onClick={() => setMergeConfirming(true)} disabled={!mergeFrom || !mergeInto} className="h-11">Merge</SecondaryButton>
                </div>

                {mergeConfirming && (
                  <div className="mt-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 text-sm text-amber-800 space-y-2">
                    <p>
                      This moves <strong>{membersInFrom}</strong> member{membersInFrom === 1 ? "" : "s"} and every request currently in <span className="capitalize font-semibold">{mergeFrom}</span> into <span className="capitalize font-semibold">{mergeInto}</span>, then removes <span className="capitalize font-semibold">{mergeFrom}</span> as a department.
                    </p>
                    {fromHead && intoHead && (
                      <p>
                        <span className="capitalize font-semibold">{fromHead.name}</span> is currently department head of {mergeFrom} and will lose that role — <span className="capitalize font-semibold">{intoHead.name}</span> remains department head of {mergeInto}.
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <PrimaryButton type="button" onClick={doMerge} disabled={mergeLoading} className="h-9">{mergeLoading ? "Merging..." : "Confirm merge"}</PrimaryButton>
                      <SecondaryButton type="button" onClick={() => setMergeConfirming(false)} className="h-9">Cancel</SecondaryButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        </>
      )}

      {/* Members */}
      <Section icon={Users} tone="bg-sky-50 text-sky-600" title="Team members" desc={`${members.length} member${members.length === 1 ? "" : "s"}, grouped by department.`}>
        {members.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 rounded-xl border-2 border-dashed border-slate-200">No team members yet.</p>
        ) : (
          <div className="space-y-5">
            {departmentGroups.map(([deptName, deptMembers]) => (
              <div key={deptName}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{deptName}</h3>
                  {deptName === myDepartment && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">Your department</span>}
                </div>
                <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
                  {deptMembers.map((m) => (
                    <li key={m._id} className="flex items-center gap-3 py-2.5 px-3">
                      <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">{toInitials(m.name || m.email)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-navy-900 capitalize truncate">{m.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{m.email}</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">{ROLE_LABELS[m.role] || m.role}</span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteMember(m._id)}
                          disabled={deletingId === m._id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Remove member"
                          aria-label={`Remove ${m.name}`}
                        >
                          {deletingId === m._id ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

// Approvers Tab
const ApproversTab = ({ companyId, token, companyData, refresh }) => {
  const dispatch = useDispatch();
  const employees = companyData?.employees || [];
  const approversData = companyData?.approvers || { approvers: [], funding_authority: null, verification_authority: null };
  const approverEmails = (approversData.approvers || []).map((a) => a.email);

  const [fundingApprover, setFundingApprover] = useState(approversData.funding_authority || "");
  const [vettingApprover, setVettingApprover] = useState(approversData.verification_authority || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    setFundingApprover(approversData.funding_authority || "");
    setVettingApprover(approversData.verification_authority || "");
  }, [companyData]);

  const rolesDirty =
    fundingApprover !== (approversData.funding_authority || "") ||
    vettingApprover !== (approversData.verification_authority || "");

  const toggleApprover = async (employee) => {
    setTogglingId(employee._id);
    const isApprover = employee.role === "approver";
    try {
      await api.post(
        `/approver/${isApprover ? "unassign" : "assign"}`,
        { company_id: companyId, employee_id: employee._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not update approver." }));
    } finally { setTogglingId(null); }
  };

  const saveRoles = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.post("/approver/add_role", { company_id: companyId, funding_authority: fundingApprover }, { headers: { Authorization: `Bearer ${token}` } }),
        api.post("/approver/add_role", { company_id: companyId, verification_authority: vettingApprover }, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      refresh();
    } catch (e) {
      dispatch(pushAlert({ type: "error", message: e.response?.data?.message || "Could not save approver roles." }));
    } finally { setSaving(false); }
  };

  const Picker = ({ value, onSelect, label }) => (
    <div role="radiogroup" aria-label={label} className="space-y-2">
      {approverEmails.map((email) => {
        const selected = value === email;
        return (
          <button
            key={email}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(email)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
              selected ? "bg-brand-50 ring-2 ring-brand-300" : "bg-white ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ${selected ? "ring-brand-600" : "ring-slate-300"}`}>
              {selected && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
            </span>
            <span className={`flex-1 text-sm font-medium truncate ${selected ? "text-brand-800" : "text-navy-900"}`}>{email}</span>
            {selected && <span className="text-[11px] font-semibold text-brand-700 bg-brand-100 rounded-full px-2.5 py-0.5">Selected</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section icon={UserCog} tone="bg-sky-50 text-sky-600" title="Manage approvers" desc="Choose which employees can act as approvers in your organization.">
        {employees.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 rounded-xl border-2 border-dashed border-slate-200">No employees yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-100">
            {employees.map((emp) => {
              const isApprover = emp.role === "approver";
              return (
                <li key={emp._id} className="flex flex-wrap items-center gap-3 py-3 px-4">
                  <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">{toInitials(emp.name || emp.email)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-navy-900 capitalize truncate">{emp.name}</span>
                    <span className="block text-xs text-slate-500 truncate">{emp.email}</span>
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${isApprover ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"}`}>
                    {ROLE_LABELS[emp.role] || emp.role}
                  </span>
                  <button
                    onClick={() => toggleApprover(emp)}
                    disabled={togglingId === emp._id}
                    className={`h-8 text-xs font-semibold px-3 rounded-lg transition-colors disabled:opacity-50 ${
                      isApprover ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {togglingId === emp._id ? <Spinner className="w-4 h-4" /> : isApprover ? "Remove approver" : "Make approver"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {approverEmails.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">
          Promote at least one employee to approver above before assigning funding and vetting roles.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section icon={Wallet} tone="bg-amber-50 text-amber-600" title="Funding approver" desc="Authorizes or declines disbursements and attaches proof of funds.">
              <Picker label="Funding approver" value={fundingApprover} onSelect={setFundingApprover} />
            </Section>
            <Section icon={ShieldCheck} tone="bg-emerald-50 text-emerald-600" title="Vetting approver" desc="Confirms proof of use before a request closes as approved.">
              <Picker label="Vetting approver" value={vettingApprover} onSelect={setVettingApprover} />
            </Section>
          </div>

          {(rolesDirty || saved) && (
            <div className="flex items-center justify-end gap-3">
              <Saved show={saved} />
              <PrimaryButton onClick={saveRoles} disabled={saving || !rolesDirty || !fundingApprover || !vettingApprover}>
                {saving ? <Busy label="Saving..." /> : "Save approver roles"}
              </PrimaryButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main Settings
const Settings = () => {
  const userid = getId();
  const token = getToken();
  const role = getRole();
  const companyId = getCompanyId();
  const storedUser = getDisplayName();
  const initials = toInitials(storedUser);

  const isAdmin = role === "admin";
  const isAdminOrApprover = role === "admin" || role === "approver";

  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const loadCompany = async () => {
    setCompanyLoading(true);
    try {
      const res = await api.get(`/company/get_company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanyData(res.data);
    } catch (e) { console.error(e); }
    finally { setCompanyLoading(false); }
  };

  useEffect(() => { loadCompany(); }, []);

  const tabs = [
    { key: "profile", label: "Profile", desc: "Your details and password", icon: User },
    ...(isAdminOrApprover ? [{ key: "organization", label: "Organization", desc: isAdmin ? "Budget, departments, members" : "Departments and members", icon: Building2 }] : []),
    ...(isAdmin ? [{ key: "approvers", label: "Approvers", desc: "Funding and vetting roles", icon: KeyRound }] : []),
  ];

  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader eyebrow="Settings" title="Settings" desc="Manage your profile, organization and approval preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* Section navigation: a column on desktop, a scrollable row on small screens */}
        <nav aria-label="Settings sections" className="flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-0 -mx-1 px-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left whitespace-nowrap transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"
                }`}
              >
                <tab.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-brand-600" : "text-slate-400"}`} />
                <span>
                  <span className="block text-sm font-semibold">{tab.label}</span>
                  <span className={`hidden lg:block text-xs ${active ? "text-brand-600/80" : "text-slate-400"}`}>{tab.desc}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {companyLoading ? (
            <div className="flex items-center gap-2 text-slate-400 py-12"><Spinner /><span className="text-sm">Loading...</span></div>
          ) : (
            <>
              {activeTab === "profile" && (
                <ProfileTab userid={userid} token={token} role={role} storedUser={storedUser} initials={initials} companyData={companyData} goTo={setActiveTab} />
              )}
              {activeTab === "organization" && isAdminOrApprover && (
                <OrganizationTab companyId={companyId} token={token} role={role} myDepartment={getUser()?.department} companyData={companyData} refresh={loadCompany} />
              )}
              {activeTab === "approvers" && isAdmin && (
                <ApproversTab companyId={companyId} token={token} companyData={companyData} refresh={loadCompany} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
