import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utilis/api";
import { getId, getToken } from "../utilis/storage";
import AddDepartments from "./setup/AddDepartments";
import AddApprovers from "./setup/AddApprovers";
import SetFundingApprover from "./setup/SetFundingApprover";
import SetVettingApprover from "./setup/SetVettingApprover";
import ConfirmSetUp from "./setup/ConfirmSetUp";
import ConfirmSkipModal from "../components/modal/ConfirmSkipModal";

const STEPS = [
  { key: 1, label: "Departments", short: "Add your departments" },
  { key: 2, label: "Approvers", short: "Add approver emails" },
  { key: 3, label: "Funding", short: "Assign funding approver" },
  { key: 4, label: "Vetting", short: "Assign vetting approver" },
  { key: 5, label: "Confirm", short: "Review & confirm" },
];

const SetUp = () => {
  const [stage, setStage] = useState(() => {
    const saved = localStorage.getItem("setupStage");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem("setupCompletedSteps");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [department, setDepartment] = useState([]);
  const [approver, setApprover] = useState([]);
  const [approverType, setApproverType] = useState({ fund: "", vet: "" });
  const [isSkip, setIsSkip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [stepStatus, setStepStatus] = useState(null); // { type: "success"|"error", message: string }
  const navigate = useNavigate();

  // On mount: if we're at the confirm step but in-memory data is empty, fetch from API
  useEffect(() => {
    const currentStage = parseInt(localStorage.getItem("setupStage") || "1", 10);
    if (currentStage < 5) return; // only needed on confirm step

    const id = getId();
    const token = getToken();
    if (!id || !token) return;

    const restore = async () => {
      setRestoring(true);
      try {
        const res = await api.get("/approver/get_approvers", {
          data: { company_id: id },
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.approvers;
        if (data) {
          if (data.approvers?.length) setApprover(data.approvers.map((a) => a.email));
          if (data.funding_authority) setApproverType((p) => ({ ...p, fund: data.funding_authority }));
          if (data.verification_authority) setApproverType((p) => ({ ...p, vet: data.verification_authority }));
        }
      } catch {
        // silently fail — user can still proceed
      } finally {
        setRestoring(false);
      }
    };

    restore();
  }, []); // run once on mount

  // Persist stage
  useEffect(() => {
    localStorage.setItem("setupStage", stage);
  }, [stage]);

  // Persist completed steps
  useEffect(() => {
    localStorage.setItem("setupCompletedSteps", JSON.stringify([...completedSteps]));
  }, [completedSteps]);

  // Clear step status when stage changes
  useEffect(() => {
    setStepStatus(null);
  }, [stage]);

  const addDepartment = (d) => setDepartment((p) => [...p, d]);
  const deleteDepartment = (d) => setDepartment(d);
  const addApprover = (a) => setApprover((p) => [...p, a]);
  const deleteApprover = (a) => setApprover(a);
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
    const id = getId();
    const token = getToken();

    if (stage === 5) {
      // Clear setup progress from localStorage
      localStorage.removeItem("setupStage");
      localStorage.removeItem("setupCompletedSteps");
      navigate("/employeedashboard");
      return;
    }

    // Validation per step
    if (stage === 1 && department.length === 0) {
      setStepStatus({ type: "error", message: "Please add at least one department before continuing." });
      return;
    }
    if (stage === 2 && approver.length === 0) {
      setStepStatus({ type: "error", message: "Please add at least one approver before continuing." });
      return;
    }
    if (stage === 3 && !approverType.fund) {
      setStepStatus({ type: "error", message: "Please select a funding approver before continuing." });
      return;
    }
    if (stage === 4 && !approverType.vet) {
      setStepStatus({ type: "error", message: "Please select a vetting approver before continuing." });
      return;
    }

    const calls = {
      1: {
        url: "/department/add_department",
        body: { company_id: id, departments: department.map((n) => ({ name: n })) },
        successMsg: `${department.length} department${department.length > 1 ? "s" : ""} saved successfully.`,
      },
      2: {
        url: "/approver/add_approver",
        body: { company_id: id, approvers: approver.map((e) => ({ email: e })) },
        successMsg: `${approver.length} approver${approver.length > 1 ? "s" : ""} saved successfully.`,
      },
      3: {
        url: "/approver/add_role",
        body: { company_id: id, funding_authority: approverType.fund },
        successMsg: `Funding approver set to ${approverType.fund}.`,
      },
      4: {
        url: "/approver/add_role",
        body: { company_id: id, verification_authority: approverType.vet },
        successMsg: `Vetting approver set to ${approverType.vet}.`,
      },
    };

    const call = calls[stage];
    if (call) {
      setLoading(true);
      setStepStatus(null);
      try {
        await api.post(call.url, call.body, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Mark step as completed — cannot go back unless Back is used
        setCompletedSteps((prev) => new Set([...prev, stage]));
        setStepStatus({ type: "success", message: call.successMsg });

        // Brief pause to show success before advancing
        setTimeout(() => {
          setStage((s) => s + 1);
          setLoading(false);
        }, 800);

      } catch (e) {
        const msg = e.response?.data?.message || "Something went wrong. Please try again.";
        setStepStatus({ type: "error", message: msg });
        setLoading(false);
      }
    } else {
      setStage((s) => s + 1);
    }
  };

  const Back = () => {
    // Allow going back — but clear the completed flag for the step being re-entered
    // so it can be re-submitted
    const prevStage = stage - 1;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.delete(prevStage);
      return next;
    });
    setStage(prevStage);
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
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 py-12">
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
              const done = completedSteps.has(s.key);
              const active = stage === s.key;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 ${
                      done ? "bg-brand-600 border-brand-600 text-white" :
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

          {/* Status banner */}
          {stepStatus && (
            <div className={`mb-4 flex items-start gap-3 rounded-xl px-4 py-3 border text-sm ${
              stepStatus.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {stepStatus.type === "success" ? (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
              <span>{stepStatus.message}</span>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden mb-6">
            {/* Card header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {completedSteps.has(stage) ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : stage}
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
              {restoring ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium">Restoring your setup data…</span>
                </div>
              ) : renderStep(stage)}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={Back}
              disabled={stage === 1 || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <button
              onClick={Next}
              disabled={loading}
              className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  {stage === 5 ? "Go to Dashboard" : "Continue"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <ConfirmSkipModal isOpen={isSkip} closeModal={() => setIsSkip(false)} />
    </div>
  );
};

export default SetUp;
