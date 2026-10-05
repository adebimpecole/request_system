import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CircleCheck, Info, Send, TriangleAlert, User, Users, Wallet } from "lucide-react";
import api from "../../../utilis/api";
import { getCompanyId, getUser } from "../../../utilis/storage";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";
import { Card, PrimaryButton, SecondaryButton, Spinner, money } from "../../../components/ui/PageKit";

const STEPS = ["Details", "Approvers", "Review", "Submit"];
const CATEGORIES = ["Equipment", "Labour / Services", "Materials", "Supplies", "Other Expenses"];

const inputCls =
  "block w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500";

const Label = ({ htmlFor, children, hint }) => (
  <label htmlFor={htmlFor} className="flex items-center justify-between text-xs font-semibold text-navy-900 mb-1.5">
    <span>{children} <span className="text-red-500">*</span></span>
    {hint && <span className="font-normal text-slate-400">{hint}</span>}
  </label>
);

const Stepper = ({ step }) => (
  <ol className="flex items-center gap-2 sm:gap-3 mb-8 max-w-2xl">
    {STEPS.map((label, i) => {
      const n = i + 1;
      const done = step > n;
      const active = step === n;
      return (
        <li key={label} className={`flex items-center gap-2 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            active ? "bg-brand-600 text-white ring-4 ring-brand-100" : done ? "bg-brand-100 text-brand-600" : "bg-white text-slate-400 ring-1 ring-slate-300"
          }`}>
            {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : n}
          </span>
          <span className={`text-xs whitespace-nowrap ${active ? "font-bold text-navy-900" : done ? "font-medium text-brand-600" : "text-slate-400"}`}>{label}</span>
          {i < STEPS.length - 1 && <span className={`hidden sm:block flex-1 h-0.5 rounded-full ${done ? "bg-brand-400" : "bg-slate-200"}`} />}
        </li>
      );
    })}
  </ol>
);

const NewRequest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getUser();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", amount: "", category: "", description: "", department: user.department || "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const [company, setCompany] = useState(null);
  useEffect(() => {
    api.get(`/company/get_company/${getCompanyId()}`)
      .then((res) => setCompany(res.data || {}))
      .catch(() => setCompany({}));
  }, []);

  const budget = company?.company?.budget || 0;
  const departments = (company?.departments || []).map((d) => d.name);
  const approvers = company?.approvers || {};
  const deptHead = (company?.employees || []).find((e) => e.department === form.department && e.role === "department_head");
  const exceedsBudget = budget > 0 && Number(form.amount) > budget;

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const validateDetails = () => {
    if (!form.title.trim()) return "Please enter a title.";
    if (!form.department) return "Please choose a department.";
    if (!form.category) return "Please choose a request type.";
    if (!(Number(form.amount) > 0)) return "Please enter an amount greater than zero.";
    if (exceedsBudget) return `This amount exceeds your organization's total budget (${money(budget)}).`;
    if (!form.description.trim()) return "Please describe what the funds are for.";
    return "";
  };

  const next = () => {
    if (step === 1) {
      const msg = validateDetails();
      if (msg) { setError(msg); return; }
    }
    setError("");
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await api.post("/request/new_request", form);
      setCreatedId(res.data?.request_id || res.data?.request?.request_id || null);
      setStep(4);
      dispatch(pushAlert({ type: "success", message: "Request submitted successfully." }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const chain = [
    { icon: Users, title: "Department head review", who: deptHead?.name || "No department head assigned yet", missing: !deptHead, note: "Approves or rejects for the department" },
    { icon: Wallet, title: "Funding approver", who: approvers.funding_authority || "Not assigned yet", missing: !approvers.funding_authority, note: "Checks the budget and attaches proof of funds" },
    { icon: User, title: "Department head — proof of use", who: deptHead?.name || "No department head assigned yet", missing: !deptHead, note: "Attaches proof the funds were used as intended" },
    { icon: BadgeCheck, title: "Verification approver", who: approvers.verification_authority || "Not assigned yet", missing: !approvers.verification_authority, note: "Confirms proof of use and closes the request" },
  ];

  return (
    <div className="animate-fade-in max-w-5xl">
      <button onClick={() => navigate("/employeedashboard/requests")} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900 mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </button>

      <Stepper step={step} />

      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-navy-900 tracking-tight">{step === 4 ? "Request submitted" : "Create a New Request"}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {step === 1 && "Fill in the details below to create a financial requisition."}
          {step === 2 && "This is the approval chain your request will move through."}
          {step === 3 && "Check everything before you submit."}
          {step === 4 && "Your request is on its way through the approval chain."}
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-700">
          <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {step === 1 && (
        <Card className="p-5 sm:p-6">
          <p className="text-sm font-bold text-navy-900 mb-5">Request details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <input id="title" name="title" className={inputCls} placeholder="e.g. Office supplies for HQ" value={form.title} onChange={onChange} />
            </div>
            <div>
              <Label htmlFor="department" hint={user.department ? "Your department" : null}>Department</Label>
              <select id="department" name="department" className={`${inputCls} capitalize`} value={form.department} onChange={onChange} disabled={!!user.department}>
                <option value="">Select department</option>
                {[...new Set([...(user.department ? [user.department] : []), ...departments])].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="category">Request type</Label>
              <select id="category" name="category" className={inputCls} value={form.category} onChange={onChange}>
                <option value="">Select request type</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="amount" hint={budget > 0 ? `Budget ${money(budget)}` : null}>Amount ($)</Label>
              <input id="amount" name="amount" type="number" min="0" step="0.01" className={`${inputCls} ${exceedsBudget ? "border-red-400" : ""}`} placeholder="Enter amount" value={form.amount} onChange={onChange} />
              {exceedsBudget && <p className="mt-1 text-xs text-red-600">Exceeds your organization's total budget ({money(budget)}).</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={5} className={`${inputCls} h-auto py-2.5`} placeholder="Provide a detailed description of what the funds are for..." value={form.description} onChange={onChange} />
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-5 sm:p-6">
          {!company ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6" /></div>
          ) : (
            <ol className="space-y-0">
              {chain.map((c, i) => (
                <li key={c.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < chain.length - 1 && <span className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200" aria-hidden="true" />}
                  <span className="relative w-10 h-10 rounded-full bg-brand-50 text-brand-600 ring-4 ring-white flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-4 h-4" />
                  </span>
                  <div className="pt-0.5 min-w-0">
                    <p className="text-sm font-bold text-navy-900">{i + 1}. {c.title}</p>
                    <p className={`text-sm truncate ${c.who.includes("@") ? "" : "capitalize"} ${c.missing ? "text-amber-600" : "text-slate-600"}`}>{c.who}</p>
                    <p className="text-xs text-slate-400">{c.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex items-start gap-2.5 rounded-lg bg-brand-50 ring-1 ring-brand-100 px-3.5 py-3 text-xs text-brand-800">
            <Info className="w-4 h-4 flex-shrink-0" />
            Approvers can ask a clarification question at their stage; the request resumes where it left off once you answer.
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-5 sm:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {[["Title", form.title], ["Department", form.department], ["Request type", form.category], ["Amount", money(form.amount)]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-400 mb-0.5">{k}</dt>
                <dd className="text-sm font-semibold text-navy-900 capitalize">{v}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-400 mb-0.5">Description</dt>
              <dd className="text-sm text-slate-700 whitespace-pre-line">{form.description}</dd>
            </div>
          </dl>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-8 text-center">
          <span className="w-14 h-14 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CircleCheck className="w-7 h-7" />
          </span>
          <p className="font-bold text-navy-900 mb-1">“{form.title}” was submitted</p>
          <p className="text-sm text-slate-500 mb-6">You'll be notified as it moves through each approval stage.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {createdId && <PrimaryButton onClick={() => navigate(`/employeedashboard/request-details/${createdId}`)}>View request</PrimaryButton>}
            <SecondaryButton onClick={() => navigate("/employeedashboard/requests")}>Back to requests</SecondaryButton>
          </div>
        </Card>
      )}

      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          {step === 1 ? (
            <SecondaryButton onClick={() => navigate("/employeedashboard/requests")}>Cancel</SecondaryButton>
          ) : (
            <SecondaryButton icon={ArrowLeft} onClick={() => { setError(""); setStep((s) => s - 1); }} disabled={submitting}>Back</SecondaryButton>
          )}
          {step < 3 ? (
            <PrimaryButton onClick={next}>Next <ArrowRight className="w-4 h-4" /></PrimaryButton>
          ) : (
            <PrimaryButton onClick={submit} disabled={submitting}>
              {submitting ? <><Spinner className="w-4 h-4 text-white" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit request</>}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
};

export default NewRequest;
