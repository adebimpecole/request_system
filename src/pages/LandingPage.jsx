import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const stages = [
  {
    n: "STAGE 1",
    title: "Requester",
    desc: "Submits the request with an amount, category and description under their department.",
    tag: "SUBMITTED",
    bar: "bg-brand-950",
    tagClass: "bg-brand-50 text-brand-900",
  },
  {
    n: "STAGE 2",
    title: "Department head",
    desc: "Reviews the request for their department. Skipped automatically if the department has no head.",
    tag: "APPROVE / REJECT",
    bar: "bg-brand-900",
    tagClass: "bg-brand-50 text-brand-900",
  },
  {
    n: "STAGE 3",
    title: "Funding approver",
    desc: "Checks it against the organisation's remaining budget and attaches proof of delegated funds.",
    tag: "PROOF OF FUNDS",
    bar: "bg-brand-700",
    tagClass: "bg-brand-800 text-white",
  },
  {
    n: "STAGE 4",
    title: "Department head",
    desc: "Attaches proof that the delegated funds were used as intended.",
    tag: "PROOF OF USE",
    bar: "bg-brand-500",
    tagClass: "bg-brand-800 text-white",
  },
  {
    n: "STAGE 5",
    title: "Verification approver",
    desc: "Confirms the proof of use. The request closes as approved, with its full history attached.",
    tag: "VERIFIED",
    bar: "bg-brand-300",
    tagClass: "bg-brand-50 text-brand-900",
  },
];

const rules = [
  {
    title: "Clarification returns the request",
    desc: "The department head or verification approver can ask a question instead of approving or rejecting. The request resumes at the same stage once it's answered.",
  },
  {
    title: "Rejection ends the chain",
    desc: "A rejection closes the request. It stays on record in the audit trail, and the requester can submit a new one.",
  },
  {
    title: "Budget enforced twice",
    desc: "A request over the total budget is blocked on submission. One that would exceed what's left after already-approved requests is blocked at the funding stage.",
  },
];

const steps = [
  { n: "01", title: "Submit", desc: "An employee raises a request with an amount, category, description and department. Blocked immediately if it exceeds the total budget.", dot: "bg-brand-950" },
  { n: "02", title: "Route", desc: "It goes to the department head if one is assigned, or straight to the funding approver if not.", dot: "bg-brand-900" },
  { n: "03", title: "Fund & verify", desc: "The funding approver attaches proof of delegated funds, the department head attaches proof of use, and the verification approver confirms it.", dot: "bg-brand-700" },
  { n: "04", title: "Close out", desc: "The request is marked approved and its full timestamped history — every approval, rejection and clarification — stays attached.", dot: "bg-brand-500" },
];

const features = [
  { title: "Budget-aware approval chain", desc: "One check against the total budget at submission, another against what's actually left once approved requests are accounted for — nothing can be approved beyond what's really available.", grad: "from-brand-950 to-brand-700" },
  { title: "Department-based routing", desc: "Requests route to the department head automatically. Admins manage departments and can merge one into another without losing history.", grad: "from-brand-900 to-brand-500" },
  { title: "Clarification threads", desc: "A department head or verification approver can ask a question on the request itself instead of rejecting it outright. It resumes at the same stage once answered.", grad: "from-brand-700 to-brand-300" },
  { title: "Real-time notifications", desc: "Approvers are notified the moment a request needs them; requesters see every status change as it happens.", grad: "from-brand-950 to-brand-500" },
  { title: "Full audit trail", desc: "Every submission, approval, rejection and clarification is timestamped, attributed to who did it, and stays with the request.", grad: "from-brand-900 to-brand-300" },
  { title: "Invite-based onboarding", desc: "Admins invite teammates by email with a company code. Roles — approver, department head — are assigned from the team page as the org grows.", grad: "from-brand-700 to-brand-200" },
];

const faqs = [
  { q: "What counts as a financial request?", a: "Any request for company funds — a purchase, reimbursement or similar — submitted with an amount, category and description under a department." },
  { q: "Who approves a request?", a: "Normally the department head first, then the funding approver, who attaches proof of delegated funds, then the department head again for proof of use, then the verification approver. If a department has no head, it goes straight to the funding approver." },
  { q: "What happens when an approver asks for clarification?", a: "The request pauses with the question recorded on its thread. Once the requester (or department head, if the question came from verification) answers, it resumes at the same stage rather than starting over." },
  { q: "How is the budget enforced?", a: "At two points: a request that already exceeds the organisation's total budget is rejected on submission, and one that would exceed what's left after already-approved requests is blocked when the funding approver tries to act on it." },
  { q: "Can a rejected request be resubmitted?", a: "The rejection and its record stay in the audit trail, and the requester can submit a new request." },
  { q: "Who can see what?", a: "Requesters see their own requests. Department heads and approvers see what's waiting on their action. Admins see organisation-wide analytics, the full audit trail, and organisation settings." },
];

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-brand-950">

      <header
        className={`fixed top-0 inset-x-0 z-50 border-b transition-colors duration-300 ${scrolled
          ? "bg-white/70 backdrop-blur-md border-brand-100 shadow-sm"
          : "bg-white/10 backdrop-blur-md border-white/20"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl  flex items-center justify-center ${scrolled ? "bg-brand-900/10" : "bg-white/20"}`}>
              <svg className={`w-5 h-5 ${scrolled ? "text-brand-950" : "text-white"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`font-bold text-[17px] tracking-tight ${scrolled ? "text-brand-950" : "text-white"}`}>FinReq</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[["#how", "How it works"], ["#workflow", "Approval chain"], ["#features", "Features"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`text-sm transition-colors ${scrolled ? "text-slate-600 hover:text-brand-950" : "text-brand-100 hover:text-white"}`}
              >
                {label}
              </a>
            ))}
            <Link to="/login" className="text-sm font-semibold bg-brand-400 text-white px-4 py-2 rounded-md hover:bg-brand-200 transition-colors">
              Sign in
            </Link>
          </div>

          <button className={`md:hidden p-2 ${scrolled ? "text-brand-950" : "text-white"}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M3 6h18M3 12h18M3 18h18"} />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-brand-100 bg-white/95 backdrop-blur-md px-6 py-4 space-y-3">
            <a href="#how" className="block text-sm text-slate-600 py-1">How it works</a>
            <a href="#workflow" className="block text-sm text-slate-600 py-1">Approval chain</a>
            <a href="#features" className="block text-sm text-slate-600 py-1">Features</a>
            <a href="#faq" className="block text-sm text-slate-600 py-1">FAQ</a>
            <Link to="/login" className="block text-center text-sm font-semibold bg-brand-300 text-brand-950 px-4 py-2.5 rounded-md">Sign in</Link>
          </div>
        )}
      </header>

      <section className="pt-16 bg-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="inline-block bg-white/10 text-brand-200 border border-brand-300/40 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
                Financial request management
              </span>
              <h1 className="text-4xl lg:text-[56px] font-extrabold leading-[1.05] tracking-tight mb-5">
                Every purchase, reimbursement and financial request on one approval chain.
              </h1>
              <p className="text-brand-100 text-lg leading-relaxed mb-8 max-w-lg">
                An employee submits a request. It moves through the department head, the funding approver and the verification approver in turn, with proof of funds, proof of use and clarification captured on the request itself.
              </p>
              <div className="flex items-center flex-wrap gap-3 mb-10">
                <Link to="/login" className="inline-flex items-center justify-center px-7 py-3.5 bg-brand-300 text-brand-950 font-bold rounded-lg text-sm hover:bg-white transition-all shadow-lg shadow-brand-950/40">
                  Sign in
                </Link>
                <Link to="/pickuser" className="inline-flex items-center justify-center px-7 py-3.5 border border-white/40 hover:border-white text-white font-semibold rounded-lg text-sm transition-all">
                  Create your account
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-brand-950/50 text-brand-950">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-brand-100 pb-3.5 mb-4">
                <span className="font-mono text-xs text-slate-500">REQ-2418</span>
                <span className="font-mono text-[11px] text-brand-800 bg-brand-100 px-2.5 py-1.5 rounded">AWAITING VERIFICATION</span>
              </div>
              <p className="text-xl font-semibold mb-1">Field office equipment purchase</p>
              <p className="text-sm text-slate-500 mb-6">Requested by O. Adeyemi · Operations · $12,400</p>

              <div className="flex flex-col gap-4">
                {[
                  { t: "Department head approved", s: "14 Aug, 09:12", dot: "bg-brand-950", muted: false },
                  { t: "Clarification requested and answered", s: "Vendor quote attached · 15 Aug", dot: "bg-brand-700", muted: false },
                  { t: "Proof of delegated funds attached", s: "Funding approver · 16 Aug", dot: "bg-brand-500", muted: false },
                  { t: "Verification of fund use", s: "Pending · assigned to verification approver", dot: "border-2 border-brand-200 bg-white", muted: true },
                ].map((r) => (
                  <div key={r.t} className="flex gap-3.5 items-start">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${r.dot}`} />
                    <div>
                      <p className={`text-sm font-semibold ${r.muted ? "text-slate-500" : ""}`}>{r.t}</p>
                      <p className={`text-[13px] ${r.muted ? "text-slate-400" : "text-slate-500"}`}>{r.s}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 bg-slate-50 border-l-[3px] border-brand-500 rounded-r-md px-3.5 py-3 text-[13px] leading-relaxed text-brand-900">
                The verification approver must confirm the proof of use before this request can close as approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-[38px] font-extrabold tracking-tight mb-3">How it works</h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl">Four steps from submission to payment. Each one leaves a record.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-slate-50 border border-brand-100 rounded-xl p-6">
                <div className={`w-9 h-9 rounded-full ${s.dot} text-white font-mono text-sm flex items-center justify-center mb-5`}>{s.n}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-[15px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20 bg-slate-50 border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-[38px] font-extrabold tracking-tight mb-3">The approval chain</h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl">A request advances only when the current stage is satisfied. Denials and clarification requests send it back with a reason.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stages.map((s) => (
              <div key={s.n} className="bg-white border border-brand-100 rounded-lg overflow-hidden shadow-sm">
                <div className={`h-1 ${s.bar}`} />
                <div className="p-5">
                  <p className="font-mono text-[11px] tracking-wider text-slate-500 mb-3">{s.n}</p>
                  <p className="font-semibold text-[17px] mb-2">{s.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{s.desc}</p>
                  <span className={`inline-block font-mono text-[11px] px-2.5 py-1.5 rounded ${s.tagClass}`}>{s.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {rules.map((r) => (
              <div key={r.title} className="bg-brand-100/60 rounded-lg px-5 py-5">
                <p className="font-semibold text-[15px] mb-1.5">{r.title}</p>
                <p className="text-sm text-brand-900/80 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-[38px] font-extrabold tracking-tight mb-3">Built for how approvals actually happen</h2>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl">Budget checks, routing, notifications and the audit trail all live in the request itself — not spread across email and spreadsheets.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl overflow-hidden border border-brand-100">
                <div className={`h-1.5 bg-gradient-to-r ${f.grad}`} />
                <div className="p-6 bg-slate-50">
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-slate-50 border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl lg:text-[38px] font-extrabold tracking-tight mb-9">Questions</h2>
          <div className="flex flex-col gap-2.5">
            {faqs.map((f, i) => (
              <div key={f.q} className="bg-white border border-brand-100 rounded-lg px-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-5 py-5 text-left font-semibold text-[17px]"
                >
                  <span>{f.q}</span>
                  <span className="font-mono text-lg text-brand-700 flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <p className="text-[15px] text-slate-500 leading-relaxed border-t border-brand-50 pt-4 pb-5 pr-8">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Sign in to submit or approve a request.</h2>
            <p className="text-brand-100 text-lg max-w-md">Use your organisation account. New requesters are set up by their finance administrator.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 bg-brand-300 text-brand-950 font-bold rounded-lg text-base hover:bg-white transition-all">
              Sign in
            </Link>
            <Link to="/pickuser" className="inline-flex items-center justify-center px-8 py-4 border border-white/40 hover:border-white text-white font-semibold rounded-lg text-base transition-all">
              Create your account
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-brand-950 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap justify-between gap-4">
          <p className="text-brand-200 text-xs">© {new Date().getFullYear()} FinReq · Financial request management</p>
          <p className="text-brand-200 text-xs font-mono">Internal system</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
