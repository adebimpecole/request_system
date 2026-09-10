import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../../utilis/api";
import { getRole, getUser, getEmail, getId, getCompanyId } from "../../../utilis/storage";
import { pushAlert } from "../../../reduxtoolkit/features/alert/alertSlice";


const STATUS = {
  approved:             { cls: "status-approved", label: "Approved",              dot: "bg-emerald-500" },
  rejected:             { cls: "status-rejected", label: "Rejected",              dot: "bg-red-500"     },
  closed:               { cls: "status-rejected", label: "Closed",                dot: "bg-slate-500"   },
  pending:              { cls: "status-pending",  label: "Pending",               dot: "bg-amber-500"   },
  under_review:         { cls: "status-review",   label: "Under Review",          dot: "bg-sky-500"     },
  funded:               { cls: "status-review",   label: "Funded",                dot: "bg-violet-500"  },
  delegated:            { cls: "status-review",   label: "Delegated",             dot: "bg-indigo-500"  },
  clarification_needed: { cls: "status-pending",  label: "Clarification Needed",  dot: "bg-orange-500"  },
};

//  sub-components 

const Spinner = ({ sm }) => (
  <svg className={`${sm ? "w-4 h-4" : "w-8 h-8"} animate-spin text-brand-500`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const ProofInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Reference number, URL or description"}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
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
    <div className={`rounded-xl px-3 py-2 text-xs ${willExceed ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-50 text-slate-600 border border-slate-100"}`}>
      Remaining budget: <strong>${Math.max(status.remaining, 0).toLocaleString()}</strong> of ${status.budget.toLocaleString()}
      {willExceed && " — delegating funds for this request will exceed it."}
    </div>
  );
};

const ACTIVITY_ICONS = {
  "request.created": "📝",
  "request.approved": "✅",
  "request.rejected": "❌",
  "request.clarification_requested": "❓",
  "request.clarification_responded": "💬",
  "request.closed": "🔒",
  "request.status_overridden": "🛠️",
};

const ActivityLog = ({ requestId }) => {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get(`/audit/request/${requestId}`)
      .then((res) => { if (!cancelled) setEntries(res.data || []); })
      .catch(() => { if (!cancelled) setEntries([]); });
    return () => { cancelled = true; };
  }, [requestId]);

  if (!entries || entries.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
      <p className="text-sm font-semibold text-slate-800 mb-4">Activity</p>
      <div className="space-y-4">
        {entries.map((e) => (
          <div key={e._id} className="flex gap-3">
            <span className="text-base leading-none mt-0.5">{ACTIVITY_ICONS[e.action] || "•"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{e.message}</p>
              <p className="text-xs text-slate-400 mt-0.5">{new Date(e.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// main component 

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  };

  useEffect(() => { fetch(); }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-secondary text-sm">Go back</button>
    </div>
  );

  if (!data) return null;

  const status = data.status?.toLowerCase() || "pending";
  const cfg = STATUS[status] || STATUS.pending;
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

  // timeline 
  const STAGES = [
    { label: "Submitted",          done: true },
    { label: "Dept Head Review",   done: idx >= 1 || isFinalised },
    { label: "Funding Approved",   done: idx >= 2 || status === "approved" },
    { label: "Funds Delegated",    done: idx >= 3 || status === "approved" },
    { label: "Verified & Closed",  done: status === "approved" },
  ];

  // pending clarification (latest unanswered) 
  const pendingClarification = status === "clarification_needed"
    ? [...(data.clarification || [])].reverse().find((c) => !c.response)
    : null;

  // clarification 
  const askedByDeptHead = pendingClarification ? (pendingClarification.asked_by_role || "department_head") === "department_head" : true;
  const needsResponse = !!pendingClarification && (askedByDeptHead ? isRequester : isDeptHead);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to requests
      </button>

      {awaitingAssignment && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-amber-800 text-sm">
            {idx === 0 || idx === 2
              ? `No department head is assigned for ${data.department}, so this request can't move forward yet. An admin needs to assign one in Team.`
              : `No ${idx === 1 ? "funding" : "verification"} approver is currently assigned, so this request can't move forward yet. An admin needs to assign one in Settings → Approvers.`}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Request #{id?.slice(-8)?.toUpperCase()}</p>
              <h1 className="text-2xl font-extrabold text-white capitalize">{data.title}</h1>
              <p className="text-white/60 text-sm mt-1 capitalize">{data.category}</p>
            </div>
            <span className={cfg.cls}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "Amount",       value: `$${parseFloat(data.amount || 0).toLocaleString()}`, big: true },
              { label: "Department",   value: data.department || "—",     cap: true },
              { label: "Submitted by", value: data.requesterName || "—",  cap: true },
              { label: "Date",         value: data.date_created ? new Date(data.date_created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={item.big ? "text-2xl font-extrabold text-brand-600" : `text-sm font-semibold text-slate-800 ${item.cap ? "capitalize" : ""}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Justification</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                {data.description}
              </div>
            </div>
          )}

          {/* Proof documents */}
          {(data.proof_of_funds || data.proof_of_use) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.proof_of_funds && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Proof of Delegated Funds</p>
                  <p className="text-sm text-slate-700 break-all">{data.proof_of_funds}</p>
                </div>
              )}
              {data.proof_of_use && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Proof of Fund Use</p>
                  <p className="text-sm text-slate-700 break-all">{data.proof_of_use}</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Approval Timeline</p>
            <div className="flex items-start">
              {STAGES.map((step, i) => (
                <div key={step.label} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      status === "rejected" && i === STAGES.length - 1 ? "bg-red-500" :
                      status === "closed"   && i === STAGES.length - 1 ? "bg-slate-400" :
                      step.done ? "bg-brand-600" : "bg-slate-200"
                    }`}>
                      {step.done ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />}
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 ${STAGES[i + 1].done ? "bg-brand-500" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <p className={`mt-2 text-center px-1 text-xs font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clarification thread */}
      {data.clarification?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-800">Clarification Thread</p>
          {data.clarification.map((c, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-orange-700 mb-1">Question</p>
                <p className="text-sm text-slate-700">{c.question}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(c.asked_at).toLocaleString()}</p>
              </div>
              {c.response ? (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 ml-6">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Response</p>
                  <p className="text-sm text-slate-700">{c.response}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(c.responded_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xs text-orange-500 ml-6 italic">Awaiting response…</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Action panels ── */}

      {/* Requester: respond to clarification */}
      {needsResponse && pendingClarification && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-1">Clarification requested</p>
            <p className="text-sm text-orange-700 bg-white/60 rounded-lg p-3 border border-orange-100">
              {pendingClarification.question}
            </p>
          </div>
          <textarea
            rows={3}
            value={clarifyResponse}
            onChange={(e) => setClarifyResponse(e.target.value)}
            placeholder="Type your response…"
            className="w-full px-3 py-2 text-sm border border-orange-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
          {actionError && <p className="text-xs text-red-600">{actionError}</p>}
          <button onClick={sendResponse} disabled={acting || !clarifyResponse.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
            {acting ? <Spinner sm /> : null} Submit Response
          </button>
        </div>
      )}

      {/* Approver action panel */}
      {canApprove && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Your action is required</p>
            <p className="text-xs text-slate-500">
              {idx === 0 && "Review and approve or reject this request as department head."}
              {idx === 1 && "Attach proof of delegated funds then approve to forward to the department head."}
              {idx === 2 && "Attach proof of fund use then approve to send for verification."}
              {idx === 3 && "Verify fund use and approve to complete this request."}
            </p>
          </div>

          {idx === 1 && <FundingBudgetHint amount={parseFloat(data.amount) || 0} />}

          {(idx === 1 || idx === 2) && (
            <ProofInput
              label={idx === 1 ? "Proof of Delegated Funds *" : "Proof of Fund Use *"}
              value={proof}
              onChange={setProof}
            />
          )}

          {actionError && <p className="text-xs text-red-600">{actionError}</p>}

          <div className="flex gap-3">
            <button onClick={() => act("approve")} disabled={acting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              {acting ? <Spinner sm /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              {idx === 1 ? "Attach & Forward" : idx === 2 ? "Submit & Forward" : "Approve"}
            </button>
            <button onClick={() => act("reject")} disabled={acting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl border border-red-200 transition-colors disabled:opacity-60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Dept head or verification approver: request clarification */}
      {canClarify && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-6">
          {!showClarifyForm ? (
            <button onClick={() => setShowClarifyForm(true)}
              className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              {isDeptHead ? "Request clarification from requester" : "Request clearer proof of use from department head"}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">What do you need clarified?</p>
              <textarea rows={3} value={clarifyQuestion} onChange={(e) => setClarifyQuestion(e.target.value)}
                placeholder="Type your question…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all" />
              {actionError && <p className="text-xs text-red-600">{actionError}</p>}
              <div className="flex gap-3">
                <button onClick={sendClarify} disabled={acting || !clarifyQuestion.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {acting ? "Sending…" : "Send Question"}
                </button>
                <button onClick={() => { setShowClarifyForm(false); setClarifyQuestion(""); }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close request */}
      {canClose && (
        <div className="flex justify-end">
          <button onClick={closeRequest} disabled={acting}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 text-sm font-medium rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Request
          </button>
        </div>
      )}

      {/* Awaiting banner for non-actors */}
      {!canApprove && !needsResponse && !isFinalised && !canClarify && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {status === "clarification_needed" ? (askedByDeptHead ? "Awaiting requester response" : "Awaiting department head response") :
               idx === 0 ? "Awaiting department head review" :
               idx === 1 ? "Awaiting funding approver" :
               idx === 2 ? "Awaiting department head to delegate funds" :
               idx === 3 ? "Awaiting verification" : "In progress"}
            </p>
            <p className="text-xs text-amber-600">This request is moving through the approval chain.</p>
          </div>
        </div>
      )}

      <ActivityLog requestId={id} />
    </div>
  );
};

export default RequestDetails;
