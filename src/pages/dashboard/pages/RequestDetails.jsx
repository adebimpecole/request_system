import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const statusConfig = {
  approved: { cls: "status-approved", label: "Approved", dot: "bg-emerald-500" },
  rejected: { cls: "status-rejected", label: "Rejected", dot: "bg-red-500" },
  pending: { cls: "status-pending", label: "Pending", dot: "bg-amber-500" },
  "in-review": { cls: "status-review", label: "In Review", dot: "bg-sky-500" },
  vetted: { cls: "status-review", label: "Vetted", dot: "bg-sky-500" },
};

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/request/page/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typeof res.data === "string") {
          setHtmlContent(res.data);
        } else {
          setData(res.data);
        }
      } catch (e) {
        setError("You do not have the necessary credentials to view this request.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const status = data?.status?.toLowerCase() || "pending";
  const cfg = statusConfig[status] || statusConfig.pending;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

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

  if (htmlContent) return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to requests
      </button>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );

  if (!data) return null;

  const timeline = [
    { label: "Submitted", done: true, date: data.dateCreated },
    { label: "Under Review", done: ["vetted", "approved", "rejected"].includes(status), date: data.reviewDate },
    { label: "Vetted", done: ["approved", "rejected", "vetted"].includes(status), date: data.vettedDate },
    { label: "Final Decision", done: ["approved", "rejected"].includes(status), date: data.decisionDate },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to requests
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">Request #{id?.slice(-8)?.toUpperCase()}</p>
              <h1 className="text-2xl font-extrabold text-white capitalize">{data.title || "Financial Request"}</h1>
              <p className="text-white/60 text-sm mt-1 capitalize">{data.category}</p>
            </div>
            <span className={cfg.cls}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Amount", value: `$${parseFloat(data.amount || 0).toLocaleString()}`, bold: true },
              { label: "Department", value: data.department || "—", capitalize: true },
              { label: "Submitted by", value: data.submittedBy || data.requesterName || "—", capitalize: true },
              { label: "Date submitted", value: data.dateCreated ? new Date(data.dateCreated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-sm ${item.bold ? "text-2xl font-extrabold text-brand-600" : "font-semibold text-slate-800 " + (item.capitalize ? "capitalize" : "")}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {data.description && (
            <div className="mb-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Justification</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                {data.description}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Approval Timeline</p>
            <div className="flex items-start gap-0">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.done ? "bg-brand-600" : "bg-slate-200"}`}>
                      {step.done ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`flex-1 h-0.5 ${timeline[i + 1].done ? "bg-brand-500" : "bg-slate-200"}`} />
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <p className={`text-xs font-semibold ${step.done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
                    {step.date && <p className="text-xs text-slate-400 mt-0.5">{new Date(step.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(status === "pending" || !data.status) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Awaiting approval</p>
              <p className="text-xs text-amber-600">This request is in the review queue.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
