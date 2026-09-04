import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../../utilis/api";
import { getId, getToken, getRole, getEmail, getDisplayName, getUser, getCompanyId } from "../../../utilis/storage";
import { getApproverDesignation } from "../../../utilis/functions";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";

const avatarColors = "from-brand-400 to-brand-700";

const SectionHeader = ({ icon, label, color = "bg-brand-50 text-brand-600" }) => (
  <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
    <span className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>{icon}</span>
    {label}
  </h2>
);

const SaveBanner = ({ show }) => show ? (
  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Saved successfully!
  </div>
) : <div />;

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// Profile Tab
const ProfileTab = ({ userid, token, role, storedUser, initials, companyData }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const emptyForm = {
    firstname: "", lastname: "", department: "", email: "",
    oldpassword: "", newpassword: "", companyname: "",
  };
  const [formData, setFormData] = useState(emptyForm);
  const [initialFormData, setInitialFormData] = useState(emptyForm);
  const { firstname, lastname, department, email, oldpassword, newpassword, companyname } = formData;
  const onChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (role === "admin") {
      const user = getUser();
      const next = { ...emptyForm, companyname: user.company_name || "" };
      setFormData(next);
      setInitialFormData(next);
      return;
    }
    const load = async () => {
      try {
        const userRes = await api.get(`/employee/${userid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const next = {
          ...emptyForm,
          firstname: userRes.data.first_name || userRes.data.firstname || "",
          lastname: userRes.data.last_name || userRes.data.lastname || "",
          email: userRes.data.email || "",
          department: userRes.data.department || "",
        };
        setFormData(next);
        setInitialFormData(next);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const isDirty = Object.keys(formData).some((key) => formData[key] !== initialFormData[key]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const filtered = Object.fromEntries(Object.entries(formData).filter(([, v]) => v.trim() !== ""));
    try {
      await api.post(`/employee/${userid}`, filtered, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInitialFormData(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const departmentList = companyData?.departments || [];
  const companyName = companyData?.company?.company_name || "";
  const approverLabel = getApproverDesignation(getEmail(), companyData?.approvers);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 text-center">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColors} flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-4 shadow-lg`}>
            {initials}
          </div>
          <h3 className="font-bold text-slate-900 text-lg capitalize">{storedUser}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{getEmail()}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 ring-1 ring-brand-200 capitalize">{role}</span>
            {approverLabel && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">{approverLabel}</span>
            )}
          </div>
          {companyName && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Organization</p>
              <p className="text-sm font-semibold text-slate-800 capitalize mt-1">{companyName}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2">
            {[
              { label: "Account type", value: role },
              { label: "Department", value: department || "—" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-semibold text-slate-700 capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <SectionHeader label="Personal Information" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            } />
            <div className="grid grid-cols-2 gap-4">
              {role !== "admin" && (
                <>
                  <div>
                    <label className="label">First Name</label>
                    <input name="firstname" type="text" className="input-field" placeholder="Jane" value={firstname} onChange={onChange} />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input name="lastname" type="text" className="input-field" placeholder="Doe" value={lastname} onChange={onChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Email Address</label>
                    <input name="email" type="email" className="input-field" value={email} onChange={onChange} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Department</label>
                    {departmentList.length > 0 ? (
                      <select name="department" className="input-field" value={department} onChange={onChange}>
                        <option value="">Select department</option>
                        {departmentList.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                      </select>
                    ) : (
                      <input className="input-field bg-slate-50 cursor-not-allowed text-slate-400" placeholder="Loading departments..." disabled />
                    )}
                  </div>
                </>
              )}
              {role === "admin" && (
                <div className="col-span-2">
                  <label className="label">Company Name</label>
                  <input name="companyname" type="text" className="input-field" value={companyname} onChange={onChange} />
                </div>
              )}
              <div className="col-span-2">
                <label className="label">Organization</label>
                <input type="text" className="input-field bg-slate-50 cursor-not-allowed text-slate-400 capitalize" value={companyName || "Loading..."} readOnly />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <SectionHeader label="Change Password" color="bg-amber-50 text-amber-600" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            } />
            <div className="grid grid-cols-2 gap-4">
              {role !== "admin" && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="label">Current Password</label>
                  <input name="oldpassword" type="password" className="input-field" placeholder="Current password" value={oldpassword} onChange={onChange} />
                </div>
              )}
              <div className={role === "admin" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <label className="label">New Password</label>
                <input name="newpassword" type="password" className="input-field" placeholder="New password" value={newpassword} onChange={onChange} />
              </div>
            </div>
          </div>

          {(isDirty || saved) && (
            <div className="flex items-center justify-between">
              <SaveBanner show={saved} />
              <div className="ml-auto">
                <button type="submit" disabled={loading || !isDirty} className="btn-primary disabled:opacity-60">
                  {loading ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </form>
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

  // Group members by department
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
    } catch (e) { console.error(e); }
    finally { setBudgetLoading(false); }
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
    } catch (e) { console.error(e); }
    finally { setDeptLoading(false); }
  };

  const deleteMember = async (memberId) => {
    setDeletingId(memberId);
    try {
      await api.delete(`/employee/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refresh();
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <SectionHeader label="Budget" color="bg-emerald-50 text-emerald-600" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <p className="text-sm text-slate-500 mb-4">Set the total approved budget for your organization.</p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="label">Total Budget ($)</label>
            <input
              type="number" min="0" className="input-field"
              placeholder="e.g. 50000"
              value={budget} onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          {(budgetDirty || budgetLoading) && (
            <button onClick={saveBudget} disabled={budgetLoading} className="btn-primary disabled:opacity-60 whitespace-nowrap">
              {budgetLoading ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Save Budget"}
            </button>
          )}
        </div>
        {budgetSaved && <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Budget updated.</p>}
      </div>
      )}

      {/* Departments */}
      {isAdmin && (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <SectionHeader label="Departments" color="bg-violet-50 text-violet-600" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        } />
        <div className="flex gap-2 mb-4">
          <input
            type="text" className="input-field flex-1" placeholder="New department name"
            value={deptInput}
            onChange={(e) => { setDeptInput(e.target.value); setDeptError(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDepartment())}
          />
          <button type="button" onClick={addDepartment} className="btn-primary whitespace-nowrap">Add</button>
        </div>
        {deptError && <p className="text-red-500 text-xs mb-3">{deptError}</p>}
        {departments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">No departments yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {departments.map((d) => {
              const memberCount = members.filter((m) => m.department === d).length;
              return (
                <span key={d} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full ring-1 ring-brand-200">
                  {d}
                  {memberCount > 0 ? (
                    <span title={`${memberCount} member${memberCount === 1 ? "" : "s"} — merge into another department below to remove`} className="text-brand-300 cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </span>
                  ) : (
                    <button type="button" onClick={() => removeDepartment(d)} className="text-brand-400 hover:text-red-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
        {(deptDirty || deptSaved) && (
          <div className="flex items-center justify-between">
            <SaveBanner show={deptSaved} />
            <button onClick={saveDepartments} disabled={deptLoading || !deptDirty || departments.length === 0} className="btn-primary disabled:opacity-60 ml-auto">
              {deptLoading ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Save Departments"}
            </button>
          </div>
        )}

        {initialDepartments.length >= 2 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Merge departments</p>
            <p className="text-xs text-slate-400 mb-3">Move everyone and every request from one department into another, then remove the old one.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="label">Merge</label>
                <select
                  className="input-field capitalize"
                  value={mergeFrom}
                  onChange={(e) => { setMergeFrom(e.target.value); setMergeConfirming(false); }}
                >
                  <option value="">Select department</option>
                  {initialDepartments.filter((d) => d !== mergeInto).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Into</label>
                <select
                  className="input-field capitalize"
                  value={mergeInto}
                  onChange={(e) => { setMergeInto(e.target.value); setMergeConfirming(false); }}
                >
                  <option value="">Select department</option>
                  {initialDepartments.filter((d) => d !== mergeFrom).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setMergeConfirming(true)}
                disabled={!mergeFrom || !mergeInto}
                className="btn-secondary whitespace-nowrap disabled:opacity-50"
              >
                Merge
              </button>
            </div>

            {mergeConfirming && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
                <p>
                  This moves <strong>{membersInFrom}</strong> member{membersInFrom === 1 ? "" : "s"} and every request currently in <span className="capitalize font-semibold">{mergeFrom}</span> into <span className="capitalize font-semibold">{mergeInto}</span>, then removes <span className="capitalize font-semibold">{mergeFrom}</span> as a department.
                </p>
                {fromHead && intoHead && (
                  <p>
                    <span className="capitalize font-semibold">{fromHead.name}</span> is currently department head of {mergeFrom} and will lose that role — <span className="capitalize font-semibold">{intoHead.name}</span> remains department head of {mergeInto}.
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={doMerge} disabled={mergeLoading} className="btn-primary text-sm py-2 disabled:opacity-60">
                    {mergeLoading ? "Merging..." : "Confirm merge"}
                  </button>
                  <button type="button" onClick={() => setMergeConfirming(false)} className="btn-secondary text-sm py-2">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <SectionHeader label="Team Members" color="bg-sky-50 text-sky-600" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        } />
        {members.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">No team members yet.</p>
        ) : (
          <div className="space-y-6">
            {departmentGroups.map(([deptName, deptMembers]) => (
              <div key={deptName}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{deptName}</h3>
                  {deptName === myDepartment && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">Your department</span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {deptMembers.map((m) => {
                    const ini = (m.name || m.email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div key={m._id} className="flex items-center gap-3 py-3 px-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {ini}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 capitalize truncate">{m.name}</p>
                          <p className="text-xs text-slate-500 truncate">{m.email}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize flex-shrink-0">{m.role}</span>
                        {isAdmin && (
                          <button
                            onClick={() => deleteMember(m._id)}
                            disabled={deletingId === m._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                            title="Remove member"
                          >
                            {deletingId === m._id ? <Spinner /> : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Approvers Tab 
const ApproversTab = ({ companyId, token, companyData, refresh }) => {
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
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
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
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const ApproverCard = ({ email, selected, onSelect }) => (
    <button
      type="button"
      onClick={() => onSelect(email)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
        selected ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50"
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
        {email[0].toUpperCase()}
      </div>
      <span className="text-sm font-medium text-slate-700 truncate flex-1">{email}</span>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Promote / demote approvers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <SectionHeader label="Manage Approvers" color="bg-violet-50 text-violet-600" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.75a1.125 1.125 0 00-1.125 1.125V18.75m3-3.375v-1.5c0-.621-.504-1.125-1.125-1.125h-.75A1.125 1.125 0 0013.5 13.875v1.5m-4.5-1.5v1.5" />
          </svg>
        } />
        <p className="text-sm text-slate-500 mb-4">Toggle which employees can act as approvers in your organization.</p>
        {employees.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl">No employees yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const isApprover = emp.role === "approver";
              return (
                <div key={emp._id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(emp.name || emp.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 capitalize truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${isApprover ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                    {emp.role}
                  </span>
                  <button
                    onClick={() => toggleApprover(emp)}
                    disabled={togglingId === emp._id}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0 ${
                      isApprover ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                    }`}
                  >
                    {togglingId === emp._id ? <Spinner /> : isApprover ? "Remove Approver" : "Make Approver"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Funding / vetting reassignment */}
      {approverEmails.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8 text-center text-slate-400 text-sm">
          Promote at least one employee to approver above before assigning funding and vetting roles.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <SectionHeader label="Funding Approver" color="bg-amber-50 text-amber-600" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            } />
            <p className="text-sm text-slate-500 mb-4">Select the approver responsible for funding decisions.</p>
            <div className="space-y-2">
              {approverEmails.map((email) => (
                <ApproverCard key={email} email={email} selected={fundingApprover === email} onSelect={setFundingApprover} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <SectionHeader label="Vetting Approver" color="bg-sky-50 text-sky-600" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            } />
            <p className="text-sm text-slate-500 mb-4">Select the approver responsible for vetting and verification.</p>
            <div className="space-y-2">
              {approverEmails.map((email) => (
                <ApproverCard key={email} email={email} selected={vettingApprover === email} onSelect={setVettingApprover} />
              ))}
            </div>
          </div>

          {(rolesDirty || saved) && (
            <div className="flex items-center justify-between">
              <SaveBanner show={saved} />
              <button onClick={saveRoles} disabled={saving || !rolesDirty || !fundingApprover || !vettingApprover} className="btn-primary disabled:opacity-60 ml-auto">
                {saving ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Save Approver Roles"}
              </button>
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
  const initials = storedUser.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

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
    { key: "profile", label: "Profile" },
    ...(isAdminOrApprover ? [{ key: "organization", label: "Organization" }] : []),
    ...(isAdmin ? [{ key: "approvers", label: "Approvers" }] : []),
  ];

  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and organization preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {companyLoading ? (
        <div className="flex items-center gap-2 text-slate-400 py-12"><Spinner /><span className="text-sm">Loading...</span></div>
      ) : (
        <>
          {activeTab === "profile" && (
            <ProfileTab userid={userid} token={token} role={role} storedUser={storedUser} initials={initials} companyData={companyData} />
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
  );
};

export default Settings;
