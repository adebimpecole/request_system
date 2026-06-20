import React, { useEffect, useState } from "react";
import axios from "axios";

const avatarColors = "from-brand-400 to-brand-700";

const Settings = () => {
  const [departmentList, setDepartmentList] = useState([]);
  const [company, setCompany] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const userid = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const storedUser = localStorage.getItem("user") || "";

  const [formData, setFormData] = useState({
    firstname: "", lastname: "", department: "", email: "",
    oldpassword: "", newpassword: "", companyname: "",
  });

  const { firstname, lastname, department, email, oldpassword, newpassword, companyname } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/employee/${userid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companycode = userRes.data.companyid;
        const [deptRes, compRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/department/get_department/${companycode}`),
          axios.get(`http://localhost:5000/api/company/get_company/${companycode}`),
        ]);
        setDepartmentList(deptRes?.data || []);
        setCompany(compRes.data.companyname || "");
        setFormData((prev) => ({
          ...prev,
          firstname: userRes.data.firstname || "",
          lastname: userRes.data.lastname || "",
          email: userRes.data.email || "",
          department: userRes.data.department || "",
        }));
      } catch (e) { console.error(e); }
    };
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v.trim() !== "")
    );
    try {
      await axios.post(`http://localhost:5000/api/employee/${userid}`, filteredFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const initials = storedUser.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 text-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColors} flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-4 shadow-lg`}>
              {initials}
            </div>
            <h3 className="font-bold text-slate-900 text-lg capitalize">{storedUser}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{localStorage.getItem("email") || ""}</p>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 ring-1 ring-brand-200 capitalize">
                {role}
              </span>
            </div>
            {company && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Organization</p>
                <p className="text-sm font-semibold text-slate-800 capitalize mt-1">{company}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2">
              {[
                { label: "Account type", value: role, capitalize: true },
                { label: "Department", value: department || "—", capitalize: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-xs font-semibold text-slate-700 ${item.capitalize ? "capitalize" : ""}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Profile section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input name="firstname" type="text" className="input-field" placeholder="Jane" value={firstname} onChange={onChange} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input name="lastname" type="text" className="input-field" placeholder="Doe" value={lastname} onChange={onChange} />
                </div>
                {role !== "admin" && (
                  <>
                    <div className="col-span-2">
                      <label className="label">Email Address</label>
                      <input name="email" type="email" className="input-field" placeholder="jane@company.com" value={email} onChange={onChange} />
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
                    <input name="companyname" type="text" className="input-field" placeholder="Acme Corporation" value={companyname} onChange={onChange} />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="label">Organization</label>
                  <input type="text" className="input-field bg-slate-50 cursor-not-allowed text-slate-400 capitalize" value={company || "Loading..."} readOnly />
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                Change Password
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {role !== "admin" && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Current Password</label>
                    <input name="oldpassword" type="password" className="input-field" placeholder="Enter current password" value={oldpassword} onChange={onChange} />
                  </div>
                )}
                <div className={role === "admin" ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                  <label className="label">New Password</label>
                  <input name="newpassword" type="password" className="input-field" placeholder="Enter new password" value={newpassword} onChange={onChange} />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Changes saved successfully!
                </div>
              )}
              <div className="ml-auto">
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
