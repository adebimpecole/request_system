import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Ban, BadgeCheck, Building2, CalendarDays, Check, CircleAlert, CircleCheck, CircleX, Clock,
  FileText, Lock, MessageCircleQuestion, MessageSquare, PlusCircle, SlidersHorizontal, TriangleAlert, X,
} from "lucide-react";
import api from "../../../utilis/api";
import { getRole, getUser, getEmail, getId, getCompanyId } from "../../../utilis/storage";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";
import { Card, PrimaryButton, SecondaryButton, Spinner, StatusBadge, initials, money, shortRef } from "../../../components/ui/PageKit";

const fmtDate = (d, withTime) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }) : "—";

const isUrl = (v) => /^https?:\/\//i.test(String(v || "").trim());

const ProofInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-navy-900 mb-1.5">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Reference number, URL or description"
      className="block w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
    />
  </div>
);

// Shown only to the funding approver at their stage — lets them see whether
// this request fits before they try to delegate funds, rather than only
// finding out from a rejected submission.
const FundingBudgetHint = ({ amount }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get(`/company/get_company/${getCompanyId()}`),
      api.get(`/request/stats/${getCompanyId()}`),
    ]).then(([companyRes, statsRes]) => {
      if (cancelled) return;
      const budget = companyRes.data?.company?.budget || 0;
      const disbursed = statsRes.data?.totalAmount || 0;
      setStatus({ budget, disbursed, remaining: budget - disbursed });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!status || status.budget <= 0) return null;

  const willExceed = amount > status.remaining;

  return (
    <div className={`rounded-lg px-3 py-2 text-xs ring-1 ${willExceed ? "bg-red-50 text-red-700 ring-red-200" : "bg-slate-50 text-slate-600 ring-slate-200"}`}>
      Remaining budget: <strong>{money(Math.max(status.remaining, 0))}</strong> of {money(status.budget)}
      {willExceed && " — delegating funds for this request will exceed it."}
    </div>
  );
};

const ACTIVITY = {
  "request.created": { icon: PlusCircle, tone: "bg-brand-50 text-brand-600" },
  "request.approved": { icon: CircleCheck, tone: "bg-emerald-50 text-emerald-600" },
  "request.rejected": { icon: CircleX, tone: "bg-red-50 text-red-600" },
  "request.clarification_requested": { icon: MessageCircleQuestion, tone: "bg-amber-50 text-amber-600" },
  "request.clarification_responded": { icon: MessageSquare, tone: "bg-sky-50 text-sky-600" },
  "request.closed": { icon: Lock, tone: "bg-slate-100 text-slate-600" },
  "request.status_overridden": { icon: SlidersHorizontal, tone: "bg-sky-50 text-sky-600" },
};

const STAGE_STATE = {
  done: { label: "Approved", dot: "bg-emerald-500 text-white", badge: "text-emerald-700 bg-emerald-50" },
  current: { label: "Pending", dot: "bg-white ring-2 ring-brand-500", badge: "text-amber-700 bg-amber-50" },
  clarification: { label: "Clarification", dot: "bg-white ring-2 ring-amber-500", badge: "text-amber-700 bg-amber-50" },
  rejected: { label: "Rejected", dot: "bg-red-500 text-white", badge: "text-red-700 bg-red-50" },
  closed: { label: "Closed", dot: "bg-slate-400 text-white", badge: "text-slate-600 bg-slate-100" },
  waiting: { label: "Waiting", dot: "bg-white ring-2 ring-slate-200", badge: "text-slate-500 bg-slate-100" },
};

const ProofRow = ({ label, value }) => (
  <div className="flex items-center gap-3 rounded-lg bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5">
    <span className="w-8 h-8 rounded-lg bg-white ring-1 ring-slate-200 text-brand-600 flex items-center justify-center flex-shrink-0">
      <FileText className="w-4 h-4" />
    </span>
    <span className="min-w-0">
      <span className="block text-xs font-semibold text-navy-900">{label}</span>
      {isUrl(value)
        ? <a href={value} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-600 hover:underline break-all">{value}</a>
        : <span className="block text-xs text-slate-500 break-all">{value}</span>}
    </span>
  </div>
);

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("overview");

  // Action state
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [proof, setProof] = useState("");

  // Clarification
  const [showClarifyForm, setShowClarifyForm] = useState(false);
  const [clarifyQuestion, setClarifyQuestion] = useState("");
  const [clarifyResponse, setClarifyResponse] = useState("");

  const role = getRole();
  const currentUser = getUser();
  const myEmail = getEmail();
  const myId = getId();

  const fetch = async () => {
    try {
      const res = await api.get(`/request/${id}`);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load this request.");
    } finally {
      setLoading(false);
    }
    api.get(`/audit/request/${id}`)
      .then((res) => setEntries(res.data || []))
      .catch(() => setEntries([]));
  };

  useEffect(() => { fetch(); }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner className="w-8 h-8" /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <span className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <TriangleAlert className="w-8 h-8 text-red-500" />
      </span>
      <p className="text-navy-900 font-semibold">{error}</p>
      <SecondaryButton onClick={() => navigate("/employeedashboard/requests")}>Back to requests</SecondaryButton>
    </div>
  );

  if (!data) return null;

  const status = data.status?.toLowerCase() || "pending";
  const idx = data.approval_index ?? 0;
  const isFinalised = ["approved", "rejected", "closed"].includes(status);

  // who can do what
  const isDeptHead = role === "department_head" && currentUser.department === data.department;
  const isFundingApprover = myEmail === data.funding_authority;
  const isVerificationApprover = myEmail === data.verification_authority;
  const isRequester = myId === String(data.user_id);

  // whether this user is the current actor for approval
  const canApprove = !isFinalised && status !== "clarification_needed" && (
    (idx === 0 && isDeptHead) ||
    (idx === 1 && isFundingApprover) ||
    (idx === 2 && isDeptHead) ||
    (idx === 3 && isVerificationApprover)
  );

  const canClarify = (isDeptHead || (idx === 3 && isVerificationApprover)) && !isFinalised;
  const canClose = (isRequester || isDeptHead) && !isFinalised && status !== "delegated";

  // no one is currently assigned to act at this stage the request can't move until an admin assigns a funding/verification approver, or a department head, for this department.
  const awaitingAssignment = !isFinalised && status !== "clarification_needed" && (
    (idx === 1 && !data.funding_authority) ||
    (idx === 3 && !data.verification_authority) ||
    ((idx === 0 || idx === 2) && !data.has_department_head)
  );

  // handlers
  const act = async (action) => {
    if ((idx === 1 || idx === 2) && action === "approve" && !proof.trim()) {
      setActionError("Please attach proof before approving.");
      return;
    }
    setActing(true); setActionError("");
    try {
      await api.post(`/request/${id}/approve`, { action, proof: proof.trim() });
      await fetch();
      setProof("");
      dispatch(pushAlert({
        type: "success",
        message: action === "approve" ? "Request approved." : "Request rejected.",
      }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Action failed.");
    } finally { setActing(false); }
  };

  const sendClarify = async () => {
    if (!clarifyQuestion.trim()) return;
    setActing(true); setActionError("");
    try {
      await api.post(`/request/${id}/clarify`, { question: clarifyQuestion });
      await fetch();
      setClarifyQuestion(""); setShowClarifyForm(false);
      dispatch(pushAlert({ type: "success", message: "Clarification request sent." }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed to send clarification.");
    } finally { setActing(false); }
  };

  const sendResponse = async () => {
    if (!clarifyResponse.trim()) return;
    setActing(true); setActionError("");
    try {
      await api.post(`/request/${id}/respond`, { response: clarifyResponse });
      await fetch();
      setClarifyResponse("");
      dispatch(pushAlert({ type: "success", message: "Response submitted." }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed to submit response.");
    } finally { setActing(false); }
  };

  const closeRequest = async () => {
    if (!window.confirm("Close this request? This cannot be undone.")) return;
    setActing(true);
    try {
      await api.post(`/request/${id}/close`);
      await fetch();
      dispatch(pushAlert({ type: "success", message: "Request closed." }));
    } catch (e) {
      setActionError(e.response?.data?.message || "Failed to close request.");
    } finally { setActing(false); }
  };

  // pending clarification (latest unanswered)
  const pendingClarification = status === "clarification_needed"
    ? [...(data.clarification || [])].reverse().find((c) => !c.response)
    : null;
  const askedByDeptHead = pendingClarification ? (pendingClarification.asked_by_role || "department_head") === "department_head" : true;
  const needsResponse = !!pendingClarification && (askedByDeptHead ? isRequester : isDeptHead);

  // Approval workflow. Each approval advances the request one stage, so the
  // n-th "approved" audit entry (oldest first) dates stage n.
  const chronological = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const approvedAt = chronological.filter((e) => e.action === "request.approved").map((e) => e.createdAt);
  const endedAt = chronological.find((e) => e.action === "request.rejected" || e.action === "request.closed")?.createdAt;
  const deptHeadLabel = data.has_department_head ? `${data.department} department head` : "No department head assigned";

  const stages = [
    { title: "Department head review", who: deptHeadLabel, note: "Approves or rejects for the department" },
    { title: "Funding approver", who: data.funding_authority || "Not assigned", note: "Checks the budget and attaches proof of funds", proof: data.proof_of_funds, proofLabel: "Proof of delegated funds" },
    { title: "Proof of use", who: deptHeadLabel, note: "Department head attaches proof the funds were used", proof: data.proof_of_use, proofLabel: "Proof of fund use" },
    { title: "Verification approver", who: data.verification_authority || "Not assigned", note: "Confirms the proof of use and closes the request" },
  ].map((s, k) => {
    let state = "waiting";
    if (status === "approved" || k < idx) state = "done";
    else if (k === idx) state = status === "rejected" ? "rejected" : status === "closed" ? "closed" : status === "clarification_needed" ? "clarification" : "current";
    const date = state === "done" ? approvedAt[k] : state === "rejected" || state === "closed" ? endedAt : null;
    return { ...s, state, date };
  });

  const clarifications = data.clarification || [];
  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "approvals", label: "Approvals" },
    { key: "activity", label: "Activity", count: entries.length },
    { key: "clarifications", label: "Clarifications", count: clarifications.length },
  ];

  const waitingOn =
    status === "clarification_needed" ? (askedByDeptHead ? "Awaiting requester response" : "Awaiting department head response") :
    idx === 0 ? "Awaiting department head review" :
    idx === 1 ? "Awaiting funding approver" :
    idx === 2 ? "Awaiting department head to attach proof of use" :
    idx === 3 ? "Awaiting verification" : "In progress";

  const Workflow = ({ detailed }) => (
    <ol>
      {stages.map((s, k) => {
        const st = STAGE_STATE[s.state];
        return (
          <li key={s.title} className="relative flex gap-3 pb-5 last:pb-0">
            {k < stages.length - 1 && (
              <span className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${s.state === "done" ? "bg-emerald-300" : "bg-slate-200"}`} aria-hidden="true" />
            )}
            <span className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${st.dot}`}>
              {s.state === "done" && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              {s.state === "rejected" && <X className="w-3.5 h-3.5" strokeWidth={3} />}
              {s.state === "closed" && <Ban className="w-3.5 h-3.5" />}
              {s.state === "current" && <span className="w-2 h-2 rounded-full bg-brand-500" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-900">{s.title}</p>
              <p className={`text-xs text-slate-500 truncate ${s.who.includes("@") ? "" : "capitalize"}`}>{s.who}</p>
              <span className={`inline-block mt-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${st.badge}`}>{st.label}</span>
              {s.date && <p className="text-[11px] text-slate-400 mt-1">{fmtDate(s.date, true)}</p>}
              {detailed && (
                <>
                  <p className="text-xs text-slate-400 mt-1">{s.note}</p>
                  {s.proof && <div className="mt-2"><ProofRow label={s.proofLabel} value={s.proof} /></div>}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  const ActivityList = () => (
    entries.length === 0 ? (
      <p className="text-sm text-slate-400 text-center py-8">No activity recorded yet.</p>
    ) : (
      <ol>
        {chronological.slice().reverse().map((e, i, arr) => {
          const a = ACTIVITY[e.action] || { icon: CircleAlert, tone: "bg-slate-100 text-slate-500" };
          return (
            <li key={e._id} className="relative flex gap-3 pb-5 last:pb-0">
              {i < arr.length - 1 && <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" aria-hidden="true" />}
              <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.tone}`}>
                <a.icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm text-navy-900">{e.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">{e.actor_name ? `${e.actor_name} · ` : ""}{fmtDate(e.createdAt, true)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    )
  );

  const ClarificationThread = () => (
    clarifications.length === 0 ? (
      <p className="text-sm text-slate-400 text-center py-8">No clarification questions on this request.</p>
    ) : (
      <div className="space-y-4">
        {clarifications.map((c, i) => (
          <div key={i} className="space-y-2">
            <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Question</p>
              <p className="text-sm text-slate-700">{c.question}</p>
              <p className="text-xs text-slate-400 mt-1">{fmtDate(c.asked_at, true)}</p>
            </div>
            {c.response ? (
              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-4 ml-6">
                <p className="text-xs font-semibold text-slate-600 mb-1">Response</p>
                <p className="text-sm text-slate-700">{c.response}</p>
                <p className="text-xs text-slate-400 mt-1">{fmtDate(c.responded_at, true)}</p>
              </div>
            ) : (
              <p className="text-xs text-amber-600 ml-6 italic">Awaiting response…</p>
            )}
          </div>
        ))}
      </div>
    )
  );

  const outcomeBanner = {
    approved: { cls: "bg-emerald-50 ring-emerald-200 text-emerald-800", icon: CircleCheck, text: "This request has been approved and verified. Its full history stays on record." },
    rejected: { cls: "bg-red-50 ring-red-200 text-red-800", icon: CircleX, text: "This request was rejected. The requester can submit a new one." },
    closed: { cls: "bg-slate-50 ring-slate-200 text-slate-700", icon: Lock, text: "This request was closed before it completed." },
  }[status];

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate("/employeedashboard/requests")} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900">
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </button>

      {/* Header */}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-[28px] font-extrabold text-navy-900 tracking-tight font-mono">{shortRef(id)}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="text-lg font-semibold text-slate-700 capitalize">{data.title}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Created {fmtDate(data.date_created)}</span>
          <span className="inline-flex items-center gap-1.5 capitalize"><Building2 className="w-3.5 h-3.5" /> {data.department || "—"} department</span>
        </p>
      </div>

      {awaitingAssignment && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-4 py-3">
          <TriangleAlert className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            {idx === 0 || idx === 2
              ? `No department head is assigned for ${data.department}, so this request can't move forward yet. An admin needs to assign one in Team.`
              : `No ${idx === 1 ? "funding" : "verification"} approver is currently assigned, so this request can't move forward yet. An admin needs to assign one in Settings → Approvers.`}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-navy-900"
            }`}
          >
            {t.label}
            {t.count > 0 && <span className="ml-1.5 text-xs text-slate-400">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Summary strip */}
      <Card className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-slate-100">
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Amount</p>
          <p className="text-xl font-extrabold text-navy-900">{money(data.amount)}</p>
        </div>
        <div className="px-5 py-4 min-w-0">
          <p className="text-xs text-slate-400 mb-1">Requested by</p>
          <p className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{initials(data.requesterName) || "?"}</span>
            <span className="text-sm font-semibold text-navy-900 capitalize truncate">{isRequester ? "You" : data.requesterName || "—"}</span>
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Date</p>
          <p className="text-sm font-semibold text-navy-900">{fmtDate(data.date_created)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400 mb-1">Request type</p>
          <p className="text-sm font-semibold text-navy-900 capitalize">{data.category || "—"}</p>
        </div>
      </Card>

      {outcomeBanner && (
        <div className={`flex items-center gap-3 rounded-xl ring-1 px-4 py-3 text-sm font-medium ${outcomeBanner.cls}`}>
          <outcomeBanner.icon className="w-5 h-5 flex-shrink-0" /> {outcomeBanner.text}
        </div>
      )}

      {/* Requester / dept head: respond to clarification */}
      {needsResponse && pendingClarification && (
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-5 space-y-3">
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1.5">Clarification requested</p>
            <p className="text-sm text-amber-800 bg-white/70 rounded-lg p-3 ring-1 ring-amber-100">{pendingClarification.question}</p>
          </div>
          <textarea
            rows={3}
            value={clarifyResponse}
            onChange={(e) => setClarifyResponse(e.target.value)}
            placeholder="Type your response…"
            className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
          />
          {actionError && <p className="text-xs text-red-600">{actionError}</p>}
          <button onClick={sendResponse} disabled={acting || !clarifyResponse.trim()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {acting && <Spinner className="w-4 h-4 text-white" />} Submit response
          </button>
        </div>
      )}

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6">
          <Card className="p-5 sm:p-6">
            <p className="text-sm font-bold text-navy-900 mb-4">Request details</p>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Request type</dt>
                <dd className="text-sm text-navy-900 capitalize">{data.category || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Department</dt>
                <dd className="text-sm text-navy-900 capitalize">{data.department || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Description</dt>
                <dd className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.description || "No description provided."}</dd>
              </div>
              {(data.proof_of_funds || data.proof_of_use) && (
                <div>
                  <dt className="text-xs text-slate-400 mb-1.5">Proofs</dt>
                  <dd className="space-y-2">
                    {data.proof_of_funds && <ProofRow label="Proof of delegated funds" value={data.proof_of_funds} />}
                    {data.proof_of_use && <ProofRow label="Proof of fund use" value={data.proof_of_use} />}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold text-navy-900 mb-4">Approval workflow</p>
            <Workflow />
          </Card>
        </div>
      )}

      {tab === "approvals" && (
        <Card className="p-5 sm:p-6 max-w-2xl"><Workflow detailed /></Card>
      )}

      {tab === "activity" && (
        <Card className="p-5 sm:p-6 max-w-3xl"><ActivityList /></Card>
      )}

      {tab === "clarifications" && (
        <Card className="p-5 sm:p-6 max-w-3xl"><ClarificationThread /></Card>
      )}

      {/* Actions */}
      {(canApprove || canClarify || canClose) && (
        <Card className="p-5 space-y-4">
          {canApprove && (
            <div>
              <p className="text-sm font-bold text-navy-900">Your action is required</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {idx === 0 && "Review and approve or reject this request as department head."}
                {idx === 1 && "Attach proof of delegated funds, then approve to forward it to the department head."}
                {idx === 2 && "Attach proof of fund use, then approve to send it for verification."}
                {idx === 3 && "Verify the fund use and approve to complete this request."}
              </p>
            </div>
          )}

          {canApprove && idx === 1 && <FundingBudgetHint amount={parseFloat(data.amount) || 0} />}

          {canApprove && (idx === 1 || idx === 2) && (
            <ProofInput label={idx === 1 ? "Proof of delegated funds *" : "Proof of fund use *"} value={proof} onChange={setProof} />
          )}

          {showClarifyForm && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-navy-900">What do you need clarified?</p>
              <textarea rows={3} value={clarifyQuestion} onChange={(e) => setClarifyQuestion(e.target.value)}
                placeholder="Type your question…"
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              <div className="flex gap-2">
                <button onClick={sendClarify} disabled={acting || !clarifyQuestion.trim()}
                  className="h-9 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                  {acting ? "Sending…" : "Send question"}
                </button>
                <button onClick={() => { setShowClarifyForm(false); setClarifyQuestion(""); }} className="h-9 px-3 text-sm font-semibold text-slate-500 hover:text-navy-900">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {actionError && <p className="text-xs text-red-600">{actionError}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {canClose && (
              <SecondaryButton icon={Lock} onClick={closeRequest} disabled={acting}>Close request</SecondaryButton>
            )}
            {canClarify && !showClarifyForm && (
              <SecondaryButton icon={MessageCircleQuestion} onClick={() => setShowClarifyForm(true)}>
                {isDeptHead ? "Ask requester" : "Ask for clearer proof"}
              </SecondaryButton>
            )}
            {canApprove && (
              <div className="flex gap-3 ml-auto">
                <button onClick={() => act("reject")} disabled={acting}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-white ring-1 ring-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-60">
                  Reject
                </button>
                <PrimaryButton onClick={() => act("approve")} disabled={acting}>
                  {acting ? <Spinner className="w-4 h-4 text-white" /> : <BadgeCheck className="w-4 h-4" />}
                  {idx === 1 ? "Attach & forward" : idx === 2 ? "Submit & forward" : "Approve"}
                </PrimaryButton>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Awaiting banner for non-actors */}
      {!canApprove && !needsResponse && !isFinalised && !canClarify && (
        <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-5 py-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-800">{waitingOn}</p>
            <p className="text-xs text-amber-700">This request is moving through the approval chain.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
