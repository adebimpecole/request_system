import React, { useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../utilis/api";
import { getCompanyId, getId } from "../../utilis/storage";
import { setToogleInviteModal } from "../../reduxtoolkit/features/modal/modalSlice";

const InviteMember = () => {
  const dispatch = useDispatch();
  const companyId = getCompanyId();
  const myId = getId();

  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const close = () => {
    dispatch(setToogleInviteModal(false));
    setEmail(""); setDepartment(""); setError(""); setInviteLink(""); setCopied(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/employee/invite", {
        email, department, company_id: companyId, invited_by: myId,
      });
      const fullLink = `${window.location.origin}${res.data.inviteLink}`;
      setInviteLink(fullLink);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create invite.");
    } finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-modal max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg">Invite a team member</h3>
          <button onClick={close} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Invite created — share this link with {email}. It expires in 24 hours.
            </p>
            <div className="flex items-center gap-2">
              <input readOnly value={inviteLink} className="input-field text-xs flex-1" />
              <button type="button" onClick={copyLink} className="btn-secondary whitespace-nowrap">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              No email delivery is configured yet, so the link isn't sent automatically — share it directly.
            </p>
            <button onClick={close} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="label">Email address</label>
              <input type="email" required className="input-field" placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Department (optional)</label>
              <input type="text" className="input-field" placeholder="e.g. Finance" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating invite..." : "Generate invite link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteMember;
