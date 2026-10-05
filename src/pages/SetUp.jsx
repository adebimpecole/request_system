import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Check, CircleCheck, ShieldCheck, TriangleAlert, Users, Wallet } from "lucide-react";
import api from "../utilis/api";
import { getCompanyId, getEmail, getId, getToken } from "../utilis/storage";
import AddDepartments from "./setup/AddDepartments";
import AddApprovers from "./setup/AddApprovers";
import SelectApprover from "./setup/SelectApprover";
import ConfirmSetUp from "./setup/ConfirmSetUp";
import ConfirmSkipModal from "../components/modal/ConfirmSkipModal";

const STEPS = [
  {
    key: 1,
    label: "Departments",
    desc: "Add the departments or branches in your organization. You can always add more later.",
    aside: { icon: Building2, text: "You can always add more departments later from Settings." },
  },
  {
    key: 2,
    label: "Approvers",
    desc: "Add the email addresses of people who will act as approvers in your organization. The admin is included by default.",
    aside: { icon: Users, text: "Approvers are the people you can assign to the funding and vetting roles in the next steps." },
  },
  {
    key: 3,
    label: "Funding",
    desc: "Select the funding approver — the person with the authority to authorize or decline a disbursement. Select one approver for this role.",
    aside: { icon: Wallet, title: "Only one person", text: "can hold the funding role. They attach proof of delegated funds before a request moves on." },
  },
  {
    key: 4,
    label: "Vetting",
    desc: "Select the vetting approver, who confirms that delegated funds were used as intended before a request closes.",
    aside: { icon: ShieldCheck, text: "This helps ensure that every request meets company policy and compliance standards." },
  },
  {
    key: 5,
    label: "Confirm",
    desc: "Review your setup before finishing. You can go back to make changes if needed.",
  },
];

// Setup progress lives in localStorage so a reload resumes where the admin left off.
// "setupStage" also tells the dashboard sidebar to show the Setup link.
const STORAGE_KEYS = ["setupStage", "setupCompletedSteps", "setupData"];

const readSaved = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const clearSetupProgress = () => STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const SetUp = () => {
  const adminEmail = getEmail();
  const saved = readSaved("setupData", null);

  const [stage, setStage] = useState(() => readSaved("setupStage", 1));
  const [completedSteps, setCompletedSteps] = useState(() => new Set(readSaved("setupCompletedSteps", [])));
  const [department, setDepartment] = useState(() => saved?.departments || []);
  const [approver, setApprover] = useState(() => saved?.approvers || (adminEmail ? [adminEmail] : []));
  const [approverType, setApproverType] = useState(() => saved?.approverType || { fund: "", vet: "" });
  const [isSkip, setIsSkip] = useState(false);
  const [loading, setLoading] = useState(false);
  // Only block the screen while restoring when there's nothing saved locally to show
  const [restoring, setRestoring] = useState(() => !saved && completedSteps.size > 0);
  const [stepStatus, setStepStatus] = useState(null); // { type: "success"|"error", message: string }
  const navigate = useNavigate();

  // On mount: refresh every step that was already saved from the server, so going
  // back always shows what's actually stored (also covers a cleared browser cache).
  useEffect(() => {
    const done = new Set(readSaved("setupCompletedSteps", []));
    if (done.size === 0) return;

    api.get(`/company/get_company/${getCompanyId()}`)
      .then((res) => {
        const company = res.data || {};
        const doc = company.approvers || {};
        const serverDepartments = (company.departments || []).map((d) => d.name);
        const serverApprovers = (doc.approvers || []).map((a) => a.email);

        if (done.has(1) && serverDepartments.length) setDepartment(serverDepartments);
        if (done.has(2) && serverApprovers.length) setApprover(serverApprovers);
        setApproverType((p) => ({
          fund: done.has(3) && doc.funding_authority ? doc.funding_authority : p.fund,
          vet: done.has(4) && doc.verification_authority ? doc.verification_authority : p.vet,
        }));
      })
      .catch(() => {
        // fall back to whatever was saved locally
      })
      .finally(() => setRestoring(false));
  }, []); // run once on mount

  // Persist progress
  useEffect(() => {
    localStorage.setItem("setupStage", JSON.stringify(stage));
  }, [stage]);

  useEffect(() => {
    localStorage.setItem("setupCompletedSteps", JSON.stringify([...completedSteps]));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem("setupData", JSON.stringify({ departments: department, approvers: approver, approverType }));
  }, [department, approver, approverType]);

  // Clear step status when stage changes
  useEffect(() => {
    setStepStatus(null);
  }, [stage]);

  // Removing an approver also clears any role they were holding
  const updateApprovers = (list) => {
    setApprover(list);
    setApproverType((p) => ({
      fund: list.includes(p.fund) ? p.fund : "",
      vet: list.includes(p.vet) ? p.vet : "",
    }));
  };

  const isAdmin = (email, index) => (adminEmail ? email === adminEmail : index === 0);

  const renderStep = (s) => {
    switch (s) {
      case 1: return <AddDepartments departments={department} onChange={setDepartment} />;
      case 2: return <AddApprovers approvers={approver} onChange={updateApprovers} isAdmin={isAdmin} />;
      case 3: return <SelectApprover label="Funding approver" approvers={approver} value={approverType.fund} onChange={(v) => setApproverType((p) => ({ ...p, fund: v }))} isAdmin={isAdmin} />;
      case 4: return <SelectApprover label="Vetting approver" approvers={approver} value={approverType.vet} onChange={(v) => setApproverType((p) => ({ ...p, vet: v }))} isAdmin={isAdmin} />;
      case 5: return <ConfirmSetUp departments={department} approvers={approver} type={approverType} isAdmin={isAdmin} onEdit={goToStep} />;
    }
  };

  const Next = async () => {
    const id = getId();
    const token = getToken();

    if (stage === 5) {
      clearSetupProgress();
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

  const confirmSkip = () => {
    clearSetupProgress();
    navigate("/employeedashboard");
  };

  // Going back to a step clears the completed flag for it and everything after,
  // so those steps are re-submitted on the way forward. The entered data stays.
  function goToStep(target) {
    setCompletedSteps((prev) => new Set([...prev].filter((k) => k < target)));
    setStage(target);
  }

  const current = STEPS.find((s) => s.key === stage);
  const AsideIcon = current?.aside?.icon;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Set up your workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your organization before inviting your team.</p>
        </div>
        <button onClick={() => setIsSkip(true)} className="text-sm text-slate-500 hover:text-navy-900 font-medium transition-colors flex-shrink-0">
          Skip setup →
        </button>
      </div>

      {/* Stepper — spans the full width of the content area */}
      <ol className="flex w-full mb-10 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-card px-2 py-5">
        {STEPS.map((s, i) => {
          const done = completedSteps.has(s.key);
          const active = stage === s.key;
          return (
            <li key={s.key} className="relative flex-1 flex flex-col items-center">
              {i < STEPS.length - 1 && (
                <span className={`absolute top-4 left-1/2 w-full h-0.5 ${done ? "bg-brand-400" : "bg-slate-200"}`} aria-hidden="true" />
              )}
              <span
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  active ? "bg-brand-600 text-white ring-4 ring-brand-100"
                    : done ? "bg-brand-100 text-brand-600 ring-1 ring-brand-300"
                      : "bg-white text-slate-500 ring-1 ring-slate-300"
                }`}
              >
                {done && !active ? <Check className="w-4 h-4" strokeWidth={3} /> : s.key}
              </span>
              <span className={`mt-2 text-[11px] sm:text-xs ${active ? "text-brand-600 font-bold" : done ? "text-brand-600 font-medium" : "text-slate-400"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Step header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">{stage}</span>
          <h2 className="text-lg font-bold text-navy-900">{current?.label}</h2>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl">{current?.desc}</p>
      </div>

      {/* Status banner */}
      {stepStatus && (
        <div className={`mb-5 flex items-start gap-3 rounded-xl px-4 py-3 ring-1 text-sm ${
          stepStatus.type === "success" ? "bg-emerald-50 ring-emerald-200 text-emerald-700" : "bg-red-50 ring-red-200 text-red-700"
        }`}>
          {stepStatus.type === "success"
            ? <CircleCheck className="w-5 h-5 flex-shrink-0" />
            : <TriangleAlert className="w-5 h-5 flex-shrink-0" />}
          <span>{stepStatus.message}</span>
        </div>
      )}

      {/* Step hint — inline above the content rather than a side panel of mismatched height */}
      {current?.aside && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-50 ring-1 ring-brand-100 px-4 py-3">
          <span className="w-8 h-8 rounded-lg bg-white ring-1 ring-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
            <AsideIcon className="w-4 h-4" />
          </span>
          <p className="text-sm text-brand-900">
            {current.aside.title && <span className="font-semibold">{current.aside.title} </span>}
            {current.aside.text}
          </p>
        </div>
      )}

      <div className="min-h-[16rem]">
        {restoring ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Spinner className="w-6 h-6" />
            <span className="text-sm font-medium">Restoring your setup data…</span>
          </div>
        ) : renderStep(stage)}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => goToStep(stage - 1)}
          disabled={stage === 1 || loading}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white ring-1 ring-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={Next}
          disabled={loading || restoring}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-600/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Spinner /> Saving...</>
          ) : (
            <>{stage === 5 ? "Finish setup" : "Continue"} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      <ConfirmSkipModal isOpen={isSkip} closeModal={() => setIsSkip(false)} onSkip={confirmSkip} />
    </div>
  );
};

export default SetUp;
