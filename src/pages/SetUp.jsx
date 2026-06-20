import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AddDepartments from "./setup/AddDepartments";
import AddApprovers from "./setup/AddApprovers";
import SetFundingApprover from "./setup/SetFundingApprover";
import SetVettingApprover from "./setup/SetVettingApprover";
import ConfirmSetUp from "./setup/ConfirmSetUp";
import ConfirmSkipModal from "../components/modal/ConfirmSkipModal";

const STEPS = [
  { key: 1, label: "Departments", short: "Add your departments" },
  { key: 2, label: "Approvers",   short: "Add approver emails" },
  { key: 3, label: "Funding",     short: "Assign funding approver" },
  { key: 4, label: "Vetting",     short: "Assign vetting approver" },
  { key: 5, label: "Confirm",     short: "Review & confirm" },
];

const SetUp = () => {
  const [stage, setStage] = useState(1);
  const [department, setDepartment] = useState([]);
  const [approver, setApprover] = useState([]);
  const [approverType, setApproverType] = useState({ fund: "", vet: "" });
  const [isSkip, setIsSkip] = useState(false);
  const navigate = useNavigate();

  const addDepartment   = (d) => setDepartment((p) => [...p, d]);
  const deleteDepartment = (d) => setDepartment(d);
  const addApprover     = (a) => setApprover((p) => [...p, a]);
  const deleteApprover  = (a) => setApprover(a);
  const setApproverTypes = (val, type) => setApproverType((p) => ({ ...p, [type]: val }));

  const renderStep = (s) => {
    switch (s) {
      case 1: return <AddDepartments Add={addDepartment} Delete={deleteDepartment} />;
      case 2: return <AddApprovers Add={addApprover} Delete={deleteApprover} />;
      case 3: return <SetFundingApprover Set={setApproverTypes} approver={approver} />;
      case 4: return <SetVettingApprover Set={setApproverTypes} approver={approver} />;
      case 5: return <ConfirmSetUp approver={approver} type={approverType} departments={department} />;
    }
  };

  const Next = async () => {
    // const id    = localStorage.getItem("id");
    // const token = localStorage.getItem("token");
    if (stage === 5) { navigate("/employeedashboard"); return; }
    // const calls = {
    //   1: { url: "http://localhost:5000/api/department/add_department",  body: { companyid: id, departments: department.map((n) => ({ name: n })) } },
    //   2: { url: "http://localhost:5000/api/approver/add_approver",      body: { companyid: id, approvers: approver.map((e) => ({ email: e })) } },
    //   3: { url: "http://localhost:5000/api/approver/add_approver",      body: { companyid: id, funding_authority: approverType.fund } },
    //   4: { url: "http://localhost:5000/api/approver/add_approver",      body: { companyid: id, verification_authority: approverType.vet } },
    // };
    // if (calls[stage]) {
    //   try { await axios.post(calls[stage].url, calls[stage].body, { headers: { Authorization: `Bearer ${token}` } }); }
    //   catch (e) { console.error(e); }
    // }
    setStage((s) => s + 1);
  };

  const current = STEPS.find((s) => s.key === stage);

  return (
    <div className="min-h-screen font-sans flex flex-col">

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 tracking-tight">FinReq</span>
          </Link>
          <button
            onClick={() => setIsSkip(true)}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Skip setup →
          </button>
        </div>
      </header>

      {/* Page body */}
      <div className="flex-1 flex flex-col items-center justify-center w-full  max-w-6xl mx-auto px-6 py-12">
        <div className="w-full">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-2">Organization Setup</p>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Set up your workspace</h1>
            <p className="text-slate-500 text-sm">Configure your organization before inviting your team.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => {
              const done    = stage > s.key;
              const active  = stage === s.key;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 ${
                      done   ? "bg-brand-600 border-brand-600 text-white" :
                      active ? "bg-white border-brand-600 text-brand-600 shadow-md" :
                               "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : s.key}
                    </div>
                    <span className={`mt-1.5 text-[10px] font-semibold hidden sm:block ${active ? "text-brand-600" : done ? "text-slate-500" : "text-slate-300"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all duration-300 ${done ? "bg-brand-500" : "bg-slate-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden mb-6">
            {/* Card header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {stage}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{current?.label}</p>
                <p className="text-xs text-slate-500">{current?.short}</p>
              </div>
              <div className="ml-auto text-xs text-slate-400 font-medium">
                Step {stage} of {STEPS.length}
              </div>
            </div>

            {/* Card body */}
            <div className="p-6 min-h-[280px]">
              {renderStep(stage)}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStage((s) => Math.max(1, s - 1))}
              disabled={stage === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <button
              onClick={Next}
              className="btn-primary gap-2"
            >
              {stage === 5 ? "Go to Dashboard" : "Continue"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      <ConfirmSkipModal isOpen={isSkip} closeModal={() => setIsSkip(false)} />
    </div>
  );
};

export default SetUp;
